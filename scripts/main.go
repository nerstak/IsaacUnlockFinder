package main

import (
	"encoding/json"
	"fmt"
	"github.com/microcosm-cc/bluemonday"
	"golang.org/x/net/html"
	"gonum.org/v1/gonum/graph/encoding/dot"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

const DotGraphFile = "graph.gv"
const DirectoryImages = "images"
const UrlAchievementsWiki = "https://bindingofisaacrebirth.fandom.com/wiki/Achievements?dlcfilter=3"
const NbAchievements = 637
const ExportJsonFile = "achievements.json"

func main() {
	fmt.Println("Starting...")

	achievements := DownloadAchievements()
	adjacency := GenerateAdjacencyList()
	res := MergeAchievements(adjacency, achievements)

	SaveToJson(res)

	fmt.Println("Done!")
}

// SaveToJson saves the list of Achievement to JSON
func SaveToJson(res []*Achievement) {
	txt, err := json.MarshalIndent(res, "", "\t")
	if err != nil {
		log.Fatalln(err)
	}

	f, e := os.Create(ExportJsonFile)
	defer f.Close()
	if e != nil {
		log.Fatalln(e)
	}
	f.Write(txt)
}

// MergeAchievements merges the adjacency list with the list of Achievement
func MergeAchievements(adjacency map[string][]string, list []*Achievement) []*Achievement {
	var listResult []*Achievement

	// Achievement 77 is special: it can be unlocked by 2 different ways
	list = append(list, list[77-1].Copy("77.1"))
	list = append(list, list[77-1].Copy("77.2"))

	for _, achievement := range list {
		if achievement.Id == "77" {
			continue
		}

		achievement.RequiredForAchievements = adjacency[achievement.Id]
		listResult = append(listResult, achievement)
	}

	return listResult
}

// GenerateAdjacencyList create an adjacency list (an adjacency matrix with only non-empty elements) from the GraphViz file
func GenerateAdjacencyList() map[string][]string {
	graph := newDotGraph()
	file, err := os.ReadFile(DotGraphFile)
	if err != nil {
		log.Fatalln(err)
	}

	dot.Unmarshal(file, graph)
	return graph.AdjacencyList()
}

// removeDuplicateWhitespaces removes duplicated whitespaces in a string
func removeDuplicateWhitespaces(s string) string {
	space := regexp.MustCompile(`\s+`)
	return space.ReplaceAllString(s, " ")
}

// htmlStringCleaner cleans a string so that it is readable without tags, issue of formatting and so on
func htmlStringCleaner(s string) string {
	return html.UnescapeString(
		removeDuplicateWhitespaces(
			bluemonday.StripTagsPolicy().Sanitize(s),
		),
	)
}

// DownloadAchievements downloads the list of achievements from the Isaac Wiki and parses it
func DownloadAchievements() []*Achievement {
	s, err := download(UrlAchievementsWiki)
	if err != nil {
		log.Fatalln(err)
	}

	return htmlToAchievements(s)
}

// download a Html page located at an url
func download(url string) (page string, err error) {
	resp, err := http.Get(url)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	buf := new(strings.Builder)
	_, err = io.Copy(buf, resp.Body)
	if err != nil {
		return
	}

	return buf.String(), nil
}

// downloadToFile downloads a file from an url to a path
func downloadToFile(url string, path string) (err error) {
	resp, err := http.Get(url)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	f, err := os.Create(path)
	if err != nil {
		return
	}
	defer f.Close()

	_, err = io.Copy(f, resp.Body)
	return
}

// htmlToAchievements converts an HTML page of achievements to a list of Achievement
func htmlToAchievements(html string) []*Achievement {
	var achievementsList []*Achievement
	nbTd := 0
	nbLine := 0
	nbCurrentAchievement := 1
	achievementBuilding := &Achievement{}

	for _, line := range strings.Split(strings.TrimSuffix(html, "\n"), "\n") {
		nbLine++
		line = strings.TrimSpace(line)

		if !strings.HasPrefix(line, "<td") {
			continue
		}

		switch nbTd {
		case 0:
			extractNameAndLink(line, nbLine, achievementBuilding)
		case 1:
			extractImage(line, nbLine, achievementBuilding, nbCurrentAchievement)
		case 2:
			extractDescription(line, nbLine, achievementBuilding)
		case 3:
			extractUnlockMethod(line, nbLine, achievementBuilding)
		case 4:
			extractId(line, nbLine, achievementBuilding)

		}

		// Finishing the build of the current achievement
		if nbTd < 4 {
			nbTd++
		} else {
			nbTd = 0
			achievementsList = append(achievementsList, achievementBuilding)
			achievementBuilding = &Achievement{}
			nbCurrentAchievement++
		}
		if len(achievementsList) == NbAchievements {
			return achievementsList
		}

	}
	return achievementsList
}

// extractId finds the Achievement.ID
func extractId(line string, nbLine int, achievementBuilding *Achievement) {
	r1 := regexp.MustCompile("<td style=\"text-align: center\">(\\d+)")
	elts := r1.FindAllStringSubmatch(line, -1)
	if len(elts) == 0 {
		log.Fatalln("Could not parse ID, line:" + strconv.Itoa(nbLine) + " - " + line)
	}

	achievementBuilding.Id = htmlStringCleaner(elts[0][0])
}

// extractImage downloads the Achievement.ImageName
func extractImage(line string, nbLine int, achievementBuilding *Achievement, achievementNb int) {
	r1 := regexp.MustCompile("<td>.* data-src=\"(.+?)\\?cb=\\d+\" .*")
	elts := r1.FindAllStringSubmatch(line, -1)
	if len(elts) == 0 {
		log.Fatalln("Could not parse ID, line:" + strconv.Itoa(nbLine) + " - " + line)
	}

	urlImage := elts[0][1]
	achievementBuilding.ImageName = strconv.Itoa(achievementNb) + ".png"
	os.MkdirAll(filepath.Join(".", DirectoryImages), os.ModePerm)
	err := downloadToFile(urlImage, filepath.Join(".", DirectoryImages, achievementBuilding.ImageName))
	if err != nil {
		log.Fatalln(err)
	}

	achievementBuilding.Id = htmlStringCleaner(elts[0][0])
}

// extractUnlockMethod finds the Achievement.UnlockMethod
func extractUnlockMethod(line string, nbLine int, achievementBuilding *Achievement) {
	r1 := regexp.MustCompile("<td>(.*)")
	elts := r1.FindAllStringSubmatch(line, -1)
	if len(elts) == 0 {
		log.Fatalln("Could not parse unlock method, line:" + strconv.Itoa(nbLine) + " - " + line)
	}

	achievementBuilding.UnlockMethod = htmlStringCleaner(elts[0][0])
}

// extractDescription finds the Achievement.Description
func extractDescription(line string, nbLine int, achievementBuilding *Achievement) {
	r1 := regexp.MustCompile("<td>(.*)")
	elts := r1.FindAllStringSubmatch(line, -1)
	if len(elts) == 0 {
		log.Fatalln("Could not parse description, line:" + strconv.Itoa(nbLine) + " - " + line)
	}

	achievementBuilding.Description = htmlStringCleaner(elts[0][0])
}

// extractNameAndLink finds the Achievement.Name and Achievement.Link
func extractNameAndLink(line string, nbLine int, achievementBuilding *Achievement) {
	r1 := regexp.MustCompile("<td data-sort-value=\".+?\" style=\"text-align: center\"><a href=\"/wiki/(.+?)\".*?>(.+?)</a>")
	elts := r1.FindAllStringSubmatch(line, -1)

	if len(elts) == 1 && len(elts[0]) >= 2 {
		achievementBuilding.Link = elts[0][1]
		achievementBuilding.Name = htmlStringCleaner(elts[0][2])
	} else {
		// If there is no link in the achievement
		r2 := regexp.MustCompile("<td data-sort-value=\".+?\" style=\"text-align: center[;]*\">(.*)")
		//r2 := regexp.MustCompile("\">((.+)+)")
		elts2 := r2.FindAllString(line, -1)

		if len(elts2) != 1 {
			log.Fatalln("Could not parse name and link, line: " + strconv.Itoa(nbLine) + " - " + line)
		}

		achievementBuilding.Name = htmlStringCleaner(elts2[0])
	}
}

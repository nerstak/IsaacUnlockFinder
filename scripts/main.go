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
	"regexp"
	"strings"
)

const dotGraphFile = "graph.gv"
const UrlAchievementsWiki = "https://bindingofisaacrebirth.fandom.com/wiki/Achievements?dlcfilter=3"
const nbAchievements = 637

func main() {
	fmt.Println("Starting...")

	achievements := DownloadAchievements()
	adjacency := GenerateJsonGraph()
	res := MergeAchievements(adjacency, achievements)
	txt, err := json.MarshalIndent(res, "", "\t")
	if err != nil {
		log.Fatalln(err)
	}
	f, e := os.Create("achievements.json")
	defer f.Close()
	if e != nil {
		log.Fatalln(e)
	}
	f.Write(txt)
	//	fmt.Println(string(txt))
}

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

func GenerateJsonGraph() map[string][]string {
	graph := newDotGraph()
	file, err := os.ReadFile(dotGraphFile)
	if err != nil {
		log.Fatalln(err)
	}

	dot.Unmarshal(file, graph)
	return graph.AdjacencyList()
}

func removeDuplicateWhitespaces(s string) string {
	space := regexp.MustCompile(`\s+`)
	return space.ReplaceAllString(s, " ")
}

func htmlSanitize(s string) string {
	return html.UnescapeString(
		removeDuplicateWhitespaces(
			bluemonday.StripTagsPolicy().Sanitize(s),
		),
	)
}

func DownloadAchievements() []*Achievement {
	s, err := download(UrlAchievementsWiki)
	if err != nil {
		log.Fatalln(err)
	}
	return htmlToAchievements(s)
}

func download(url string) (page string, err error) {
	resp, err := http.Get(url)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	buf := new(strings.Builder)
	_, err = io.Copy(buf, resp.Body)
	// check errors

	return buf.String(), err
}

/*
Convert HTML page of achievements to a list of Achievement
*/
func htmlToAchievements(html string) []*Achievement {
	var achievementsList []*Achievement
	nbTd := 0
	nbLine := 0
	achievementBuilding := &Achievement{}

	for _, line := range strings.Split(strings.TrimSuffix(html, "\n"), "\n") {
		nbLine++
		line = strings.TrimSpace(line)

		if !strings.HasPrefix(line, "<td") {
			continue
		}

		switch nbTd {
		case 0: // Name + Link
			{
				r1 := regexp.MustCompile("<td data-sort-value=\".+?\" style=\"text-align: center\"><a href=\"/wiki/(.+?)\".*?>(.+?)</a>")
				elts := r1.FindAllStringSubmatch(line, -1)

				if len(elts) == 1 && len(elts[0]) >= 2 {
					achievementBuilding.Link = elts[0][1]
					achievementBuilding.Name = htmlSanitize(elts[0][2])
				} else {
					// If there is no link in the achievement
					r2 := regexp.MustCompile("<td data-sort-value=\".+?\" style=\"text-align: center[;]*\">(.*)")
					//r2 := regexp.MustCompile("\">((.+)+)")
					elts2 := r2.FindAllString(line, -1)

					if len(elts2) != 1 {
						log.Fatalln("Could not parse name and link, line: " + string(nbLine) + " - " + line)
					}

					achievementBuilding.Name = htmlSanitize(elts2[0])
				}
			}
		// case 1: // Image => Don't care
		case 2: // Description
			{
				r1 := regexp.MustCompile("<td>(.*)")
				elts := r1.FindAllStringSubmatch(line, -1)
				if len(elts) == 0 {
					log.Fatalln("Could not parse description, line:" + string(nbLine) + " - " + line)
				}

				achievementBuilding.Description = htmlSanitize(elts[0][0])
			}
		case 3: // Unlock Method
			{
				r1 := regexp.MustCompile("<td>(.*)")
				elts := r1.FindAllStringSubmatch(line, -1)
				if len(elts) == 0 {
					log.Fatalln("Could not parse unlock method, line:" + string(nbLine) + " - " + line)
				}

				achievementBuilding.UnlockMethod = htmlSanitize(elts[0][0])
			}
		case 4: // ID
			{
				r1 := regexp.MustCompile("<td style=\"text-align: center\">(\\d+)")
				elts := r1.FindAllStringSubmatch(line, -1)
				if len(elts) == 0 {
					log.Fatalln("Could not parse ID, line:" + string(nbLine) + " - " + line)
				}

				achievementBuilding.Id = htmlSanitize(elts[0][0])
			}
		}
		if nbTd < 4 {
			nbTd++
		} else {
			nbTd = 0
			achievementsList = append(achievementsList, achievementBuilding)
			achievementBuilding = &Achievement{}
		}
		if len(achievementsList) == nbAchievements {
			return achievementsList
		}

	}
	return achievementsList
}

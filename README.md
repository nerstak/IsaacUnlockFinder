# Isaac Unlock Finder
## Description

An application to identify (from a Repentance save file) the list of achievement :
 - that are unlockable from a milestone 
 - blocked because of others haven't been unlocked

**Current state**: ~276/637 achievements are registered in the graph (Base game + Afterbirth)

### Technologies used:
FrontEnd: 
- Angular (with Typescript), using Angular Material
- Tailwind
- Kaitai Struct


Dependency graph and resources:
- Golang
- GraphViz (`dot` format)

### Features
The main goal of this application was to generate a dependency graph of achievements, in order to find out more easily on which one to focus (and not to lose time on achievements that are currenlty not accessible, because other needs to be unlocked).

This can already be done by browsing the [wiki](https://bindingofisaacrebirth.fandom.com/), but this requires using the correct DLC filters, and also spending *way* too much time figuring out the relationship between achievements.

Therefore, this project is organized in two parts:
- a dependency graph (created by hand-scrapping the Wiki, as there is no such structure in the game), that can be converted into JSON with additional Wiki metadata
- a user interface to measure the advancement of a player using its save file

### Usage 
#### Graph
One can open the graph file using any application supporting the GraphViz description language, specifically the `dot` one.

From the directory `scripts`, run `go run .` to start the aggregation script (from GraphViz graph and Wiki). It obviously requires Go to be installed...

#### User Interface
The website is available at [this address](https://isaac.nerstak.fr).
For development use, install NPM and Angular, run `npm install` in the root folder, then `ng serve` to start a development server.

## Related projects
- [Isaac Save Viewer](https://github.com/Zamiell/isaac-save-viewer): most of the source code dedicated to parsing and storing the save file data comes from this project, so check it out!
- [Isaac Wiki](https://bindingofisaacrebirth.fandom.com/): used as a source of knowledge and metadata
- [Kaitai Struct](https://kaitai.io/): used for reading the save file on the fly

## Questions
### "Why not a mod?"
The Isaac Modding API does not provide enough methods that would have been needed for the realisation of this project.
There is no easy way to access the main save file.


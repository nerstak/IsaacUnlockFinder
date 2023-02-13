package main

import (
  "encoding/json"
  "fmt"
  "gonum.org/v1/gonum/graph/encoding/dot"
  "log"
  "os"
)

const dotGraphFile = "graph.gv"

func main() {
  fmt.Println("Starting...")
  generateJsonGraph()
}

func generateJsonGraph() {
  graph := newDotGraph()
  file, err := os.ReadFile(dotGraphFile)
  if err != nil {
    log.Fatalln(err)
  }

  dot.Unmarshal(file, graph)
  res := graph.AdjacencyList()
  fmt.Println(len(res))
  txt, err := json.Marshal(res)
  fmt.Println(string(txt))
}

package main

import (
  "gonum.org/v1/gonum/graph"
  "gonum.org/v1/gonum/graph/simple"
)

// dotGraph provides a shim for interaction between the DOT
// unmarshaler and a simple.DirectedGraph.
type dotGraph struct {
  *simple.DirectedGraph
}

func newDotGraph() *dotGraph {
  return &dotGraph{DirectedGraph: simple.NewDirectedGraph()}
}

// NewEdge returns a DOT-aware edge.
func (g *dotGraph) NewEdge(from, to graph.Node) graph.Edge {
  e := g.DirectedGraph.NewEdge(from, to).(simple.Edge)
  return &directedEdge{Edge: e}
}

// NewNode returns a DOT-aware node.
func (g *dotGraph) NewNode() graph.Node {
  return &node{Node: g.DirectedGraph.NewNode()}
}

// SetEdge
func (g *dotGraph) SetEdge(e graph.Edge) {
  g.DirectedGraph.SetEdge(e.(*directedEdge))
}

// directedEdge is a DOT-aware edge
type directedEdge struct {
  simple.Edge
}

// node is a DOT-aware node.
type node struct {
  graph.Node
  dotID string
}

// SetDOTID sets the DOT ID of the node.
func (n *node) SetDOTID(id string) { n.dotID = id }

func (n *node) String() string { return n.dotID }

func (g *dotGraph) AdjacencyList() map[string][]string {
  al := make(map[string][]string)
  for _, e := range graph.EdgesOf(g.Edges()) {
    from := e.From().(*node).dotID
    to := e.To().(*node).dotID
    al[from] = append(al[from], to)
  }

  return al
}

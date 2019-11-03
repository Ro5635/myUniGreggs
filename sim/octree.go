package main

import (
	"fmt"
	"strings"
)

// octNode a node in the
type octNode struct {
	uni        Uni
	children   []octNode
	parent     *octNode
	empty      bool
	x, y, z    float64
	dx, dy, dz float64
}

func newOctNode(parent *octNode, x, y, z float64) octNode {
	newNode := octNode{}
	newNode.parent = parent
	newNode.empty = true
	newNode.x = x
	newNode.y = y
	newNode.z = z
	newNode.dx = (*parent).dx / 2
	newNode.dy = (*parent).dy / 2
	newNode.dz = (*parent).dz / 2
	newNode.children = make([]octNode, 0)
	return newNode
}

func buildOcttree(unis []Uni, root *octNode) {
	// Add points to tree
	for _, uni := range unis {
		octInsert(uni, root)
	}

	// Remove empty leafs
	removeEmpty(root)

}

func inside(uni Uni, node octNode) bool {
	if uni.x >= node.x &&
		uni.x < node.x+node.dx &&
		uni.y >= node.y &&
		uni.y < node.y+node.dy &&
		uni.z >= node.z &&
		uni.z < node.z+node.dz {
		return true
	}
	return false
}

func octInsert(uni Uni, node *octNode) {
	// Find the correct node to insert the data into
	if len((*node).children) > 1 {
		// Check if the node has children
		// then find the correct leaf to insert the data into
		// Loop through the children of the node and
		// check which leaf the data should be contained
		for i := 0; i < len((*node).children); i++ {
			if inside(uni, (*node).children[i]) {
				octInsert(uni, &(*node).children[i])
			}
		}
	} else if !(*node).empty && len((*node).children) == 0 {
		// if the node is not empty and does not have any children
		// split the node into 8 empty leafs.
		// Then insert the orginal node's data into a new leaf.
		// Find the leaf for the new data and insert it.

		// Create the new leafs
		for i := 0; i < 2; i++ {
			for j := 0; j < 2; j++ {
				for k := 0; k < 2; k++ {
					// Create a new leaf with half the dx, dy and dz
					(*node).children = append(
						(*node).children,
						newOctNode(node,
							(*node).x+(float64(i)*((*node).dx/2.0)),
							(*node).y+(float64(j)*((*node).dy/2.0)),
							(*node).z+(float64(k)*((*node).dz/2.0))))
				}
			}
		}

		// Insert the original node's data into the correct leaf
		for i := 0; i < len((*node).children); i++ {
			if inside((*node).uni, (*node).children[i]) {
				octInsert((*node).uni, &(*node).children[i])
			}
		}

		// Find the child to insert the new data in
		for i := 0; i < len((*node).children); i++ {
			if inside(uni, (*node).children[i]) {
				octInsert(uni, &(*node).children[i])
			}
		}

		(*node).uni = Uni{}
	} else if (*node).empty {
		// if the node is empty then insert the data into
		// the leaf node
		(*node).uni = uni
		(*node).empty = false
	}
}

func removeEmpty(node *octNode) {
	// remove any emptyleaf nodes
	for i := len((*node).children) - 1; i >= 0; i-- {
		if (*node).children[i].empty && len((*node).children) == 0 {
			// if the leaf is empty and has no children remove
			(*node).children = append((*node).children[:i], (*node).children[i+1:]...)
		} else if len((*node).children[i].children) > 0 {
			// if the node has children check the children
			// for empty nodes
			removeEmpty(&(*node).children[i])
		}
	}
}

func printOctTree(node *octNode, indents int) {
	fmt.Printf("%v%v: %v\n", strings.Repeat("\t", indents), (*node).uni.name, (*node).empty)
	for i := 0; i < len((*node).children); i++ {
		if len((*node).children[i].children) > 0 {
			printOctTree(&(*node).children[i], indents+1)
		} else {
			fmt.Printf("%v%v: %v\n", strings.Repeat("\t", indents+1), (*node).children[i].uni.name, (*node).children[i].empty)
		}
	}

}

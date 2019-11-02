package main

import (
	"fmt"
	"strings"
)

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
	// removeEmpty(root)

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
	// Try to insert particle i at node n in Octtree
	// By construction, each leaf will contain either
	// 1 or 0 particles
	if len((*node).children) > 1 {
		// if the subtree rooted at n contains more than 1 particle
		// determine which child c of node n particle i lies in
		for _, child := range (*node).children {
			if inside(uni, child) {
				octInsert(uni, &child)
			}
		}
	} else if !(*node).empty {
		fmt.Printf("Add leafs\n")
		// if the subtree rooted at n contains one particle
		// n is a leaf
		// add n's eight children to the octtree
		for i := 0; i < 2; i++ {
			for j := 0; j < 2; j++ {
				for k := 0; k < 2; k++ {
					(*node).children = append(
						(*node).children,
						newOctNode(node,
							(*node).x+(float64(i)*((*node).dx/2.0)),
							(*node).y+(float64(j)*((*node).dy/2.0)),
							(*node).z+(float64(k)*((*node).dz/2.0))))
				}
			}
		}

		// move the particle already in n into the child
		// in which it lies
		for _, child := range (*node).children {
			if inside((*node).uni, child) {
				octInsert((*node).uni, &child)
			}
		}

		// let c be child in which particle i lie
		for _, child := range (*node).children {
			if inside(uni, child) {
				octInsert(uni, &child)
			}
		}
	} else if (*node).empty {
		// if the subtree rooted at n is empty
		// n is a leaf
		// store particle i in node n
		(*node).uni = uni
		(*node).empty = false
		fmt.Printf("Adding Uni: %v\n", uni.name)
	}
}

func removeEmpty(node *octNode) {
	for i := len((*node).children) - 1; i >= 0; i-- {
		if (*node).children[i].empty {
			(*node).children = append((*node).children[:i], (*node).children[i+1:]...)
			fmt.Printf("Remove Empty\n")
		} else if len((*node).children[i].children) > 0 {
			removeEmpty(&(*node).children[i])
		}
	}
}

func printOctTree(node *octNode, indents int) {
	fmt.Printf("%v%v: %v\n", strings.Repeat("\t", indents), (*node).uni.name, (*node).empty)
	for i := len((*node).children) - 1; i >= 0; i-- {
		if len((*node).children[i].children) > 0 {
			printOctTree(&(*node).children[i], indents+1)
		} else {
			fmt.Printf("%v%v: %v\n", strings.Repeat("\t", indents+1), (*node).children[i].uni.name, (*node).children[i].empty)
		}
	}

}

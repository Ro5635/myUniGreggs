package main

func main() {

	unis := []Uni{
		Uni{name: "Hi", x: 10.0, y: 10.0, z: 10.0},
		Uni{name: "world", x: 13.0, y: 13.0, z: 13.0},
		Uni{name: "people", x: 5.0, y: 5.0, z: 5.0},
		Uni{name: "stuff", x: 9.0, y: 9.0, z: 13.0},
	}

	// uni        Uni
	// children   []octNode
	// parent     *octNode
	// empty      bool
	// x, y, z    float64
	// dx, dy, dz float64

	root := octNode{children: make([]octNode, 0), empty: true, dx: 50, dy: 50, dz: 50}
	buildOcttree(unis, &root)
	printOctTree(&root, 0)
}

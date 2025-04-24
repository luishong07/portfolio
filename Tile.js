function reverseString(s) {
    let arr = s.split("");
    arr = arr.reverse();
    return arr.join("");
}

function compareEdge(a, b) {
    return a == reverseString(b);
}

class Tile {
    constructor(img, edges) {
        this.img = img;
        this.edges = edges;

        this.up = [];
        this.right = [];
        this.down = [];
        this.left = [];
    }

    rotate(num) {
        const w = this.img.width;
        const h = this.img.height;
        const newImage = createGraphics(w, h);
        newImage.imageMode(CENTER);
        newImage.translate(w / 2, h / 2);
        newImage.rotate(HALF_PI * num);
        newImage.image(this.img, 0, 0);

        const newEdges = [];
        const len = this.edges.length;
        for (let i = 0; i < len; i++) {
            newEdges[i] = this.edges[(i - num + len) % len];
        }
        return new Tile(newImage, newEdges);
    }

    analyze(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];
            //up
            if (compareEdge(tile.edges[2], this.edges[0])) {
                this.up.push(i);
            }
            //right
            if (compareEdge(tile.edges[3], this.edges[1])) {
                this.right.push(i);
            }
            ///down
            if (compareEdge(tile.edges[0], this.edges[2])) {
                this.down.push(i);
            }
            //left
            if (compareEdge(tile.edges[1], this.edges[3])) {
                this.left.push(i);
            }
        }
    }
}

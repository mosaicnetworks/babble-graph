# Babble-Graph
Live graphic visualization for Babble Hashgraph

## Quick Start

Run a babble node on 127.0.0.1:1337 with an attached service on 127.0.0.1:8080

```bash
cd $GOPATH/src/github.com/mosaicnetworks/babble
make && make build
./build/babble run -l=127.0.0.1:1337 -s=127.0.0.1:8080
```

Run the graph visualizator with default values

```bash
cd $THIS_REPO
npm install
./index.js
```

Go to [http://localhost:3000/](http://localhost:3000/)

## Usage

### Help

```
$> ./index.js -h
Options:
  --version      Show version number                                   [boolean]
  -l, --listen   Listening port                                  [default: 3000]
  -s, --service  Connect to the babble service       [default: "127.0.0.1:8080"]
  -h, --help     Show help                                             [boolean]
```

### Connect to custom babble service address

```
$> ./index.js -s my.babble.com:9700
```

### Listen to a custom port

```
$> ./index.js -l 3333
```

![demo.jpg](https://github.com/mosaicnetworks/babble-graph/raw/master/_media/demo.jpg)

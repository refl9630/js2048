//manipulação do estado do jogo
class gameState {
    constructor(position, animation, points, size, count) {
        this.position = position                                //array de valores das células
        this.animation = animation                              //array de animações das células
        this.score = points                                     //pontuação
        this.size = size                                        //modo
        this.moves = count                                      //contagem de movimentos
    }
    //alimenta variáveis globais e cria o tabuleiro
    createBoard () {
        let wrapper = document.getElementById('gamebox');
        let boardStr = ""
        boardSize = this.size
        score = this.score
        animated = this.animation
        moveCount = this.moves
        let position = this.position
        let gridtemplate = ""
        for (let i = 0; i < boardSize; i++) {
            gridtemplate += "68px " 
        }
        wrapper.style.gridTemplateColumns = gridtemplate
        wrapper.style.gridTemplateRows = gridtemplate
        for (let i = 0; i<boardSize*boardSize; i++) {
                boardStr += "<div><span></span></div>"
        }
        wrapper.innerHTML = boardStr
        zoom()
        //se for jogo novo, adicionar aleatório
        if (this.moves == 0) {
        drawBoard (addRandom (position))
        }
        else {
        drawBoard (position)
        }
    }
    //salva o estado do jogo em cache
    savePosition () {
        moveCount++
        if (score > highScore) {
            highScore = score
            localStorage.setItem(getHighScore(boardSize), highScore)
        }
        localStorage.setItem('save', (JSON.stringify(this)))
    }
    getPosition () {
        return this.position
    }
}
//classe célula
class cell {
    constructor (square, value, animation, manimation) {
        this.coord = square;                                    //posição
        this.value = value;                                     //valor individual
        this.animation = animation; // 0 = static; 1 = toleft; 2 = up; 3 = down; 4 = right; 5 = new
        this.manimation = manimation; // 0 = static; 1 = toleft; 2 = up; 3 = down; 4 = right; 5 = new
    }
    //alteração de cada elemento no documento
    drawSquare () {
        const squares = document.querySelectorAll('span');
        let squareElement = squares[this.coord];                        //elemento DOM
        const attr = document.createAttribute("class");
        if (this.value < 12) { 
            attr.value = colors[this.value]
        }
        else {
            attr.value = 'higher'
        }
        squareElement.setAttributeNode(attr) 
        squareElement.style.animationName = "none";
        let numb = 2**this.value                                        //valor escrito (2^valor)
        let aniNameStr = '';
        aniNameStr += moveAnimations(this.animation)
        switch (this.manimation) {
            case true:
                aniNameStr += (", " + mergeAnimations(this.value))
                break;
            default:
                break;
    }
        squareElement.style.animationName = aniNameStr;
        squareElement.innerHTML = numb
    }
}
//interação das células em cada linha ou coluna
class line {
    constructor (coords, values) {
        this.values = []                                //valor das células
        this.coords = []                                //vetor da linha
        for (let i = 0; i < boardSize; i++) {
        this.values[i] = values[i];
        this.coords[i] = coords[i];
        }
    }
    //calcular jogada e atualizar
    moveResult () {
        let myline = [];
        let mycoor = [];
        let points = 0
        let startingValues = this.values;
        let startingCoords = this.coords;
        for (let i = 0; i < boardSize; i++) {
            myline.push(startingValues[i]);
            mycoor.push(startingCoords[i]);
        }
        let merged = [];
        for (let i = 0; i<boardSize; i++) {
                for (let j = i; j<boardSize; j++){
                let checkcount = 0
                while ((myline[j] == 0) && (checkcount < boardSize)){
                    myline.splice(j, 1)
                    myline.push(0)
                    checkcount++
                }
                if ((myline[j+2] == 0)) {
                    myline.splice(j+2, 1)
                    myline.push(0)
                }
                if ((myline[j+1] == 0)) {
                    myline.splice(j+1, 1)
                    myline.push(0)
                }
                if ((myline[j] == myline[j+1]) && (myline[j] != 0)) {
                    myline[j] = (myline[j] + 1)
                    myline.splice((j+1), 1)
                    myline.push(0)
                    merged.push(mycoor[j])
                    points += (2**myline[j])
                }
            }
            }
        this.merged = merged;
        this.points = points;
        this.values = myline;
    }
}

//classes css 
let colors = ["zero", "two", "four", "eight", "sixteen", "thirtytwo", "sixtyfour", "onetwentyeight", "twofiftysix", "fivetwelve", "tentwentyfour", "twentyfortyeight"]

//variáveis do jogo atual
let boardSize = 4;                                          //tamanho do jogo
let currentState;                                           //posição atual
let animated = []                                           //animações
let mergedAnimations = []                                   
let score = 0;                                              //pontuação
let moveCount = 0;                                          //total de movimentos
let highScore = 0;                                          //pontuação recorde
let previous;                                               //estado anterior

//elementos DOM
const scoreCount = document.getElementById('score')         //pontuação escrita
const high = document.getElementById('hscore')              //pontuação máxima escrita
const wrapper = document.getElementById('gamebox');         //tabuleiro
const header = document.getElementById('header');           //cabeçálio
const menu = document.getElementById('menu');               //menu

//jogo novo
function resetBoard (size) {
    menu.setAttribute("class", "menuh")
    let testPosition = []                                   //posição inicial
    animated = []
    highScore = localStorage.getItem(getHighScore(size))
    for (let i = 0; i < size*size; i++) {
        testPosition.push(0)
        animated.push(0)
    }
    testPosition[8] = 1                                     //inicia com 1 número
    let initial = new gameState(testPosition, animated, 0, size, 0)
    initial.createBoard()
    //ajustar à tela
    zoom()
}
function sizeSelect () {
    let visi = menu.getAttribute('class')
    if (visi == "menuc") {
        menu.setAttribute("class", "menuh")
    }
    else {
        menu.setAttribute("class", "menuc")
    }
}

//desenhar no documento e salvar estado
function drawBoard (position) {
    scoreCount.innerHTML = score;
    high.innerHTML = highScore;
    let currentPosition = []
    if (canMove(position) == false) {
        window.alert('Game Over! Score:' + score)
    }
    for (let i = 0; i<position.length; i++) {
        let s = new cell(i, position[i], animated[i], mergedAnimations[i]);
        s.drawSquare();
        currentPosition[i] = position[i];
    }
    currentState = new gameState(currentPosition,animated,score,boardSize,moveCount)
    currentState.savePosition()

}
//jogada 1 = esq, 2 = cima, 3 = baixo, 4 = direita
function move (position, direction) {
    let newp = [];
    let scored = 0;
    let merged = [];
    for (let i = 0; i < (boardSize*boardSize); i++) {
        newp.push(position[i]);
    }

    for (let i = 0; i < boardSize; i++) {
        let val = [];
        let coo = [];
        switch (direction) {
            case 1:
                for (let j = 0; j < boardSize; j++) {
                    let ncoord = (i*boardSize) + j;
                    val[j] = position[ncoord];
                    coo[j] = ncoord;
                }
                break;
            case 2:
                for (let j = 0; j < boardSize; j++) {
                    let ncoord = (j*boardSize) + i;
                    val[j] = position[ncoord];
                    coo[j] = ncoord;
                }
                break;
            case 3:
                for (let j = 0; j < boardSize; j++) {
                    let ncoord = ((boardSize-(j+1))*boardSize) + i;
                    val[j] = position[ncoord];
                    coo[j] = ncoord;
                }
                break;
            case 4:
                for (let j = 0; j < boardSize; j++) {
                    let ncoord = (i*boardSize) + (boardSize-(j+1));
                    val[j] = position[ncoord];
                    coo[j] = ncoord;
                }
                break;
        }
        let newline = new line(coo, val);
        newline.moveResult();
        merged = merged.concat(newline.merged)
        scored += newline.points
        for (let k = 0; k < boardSize; k++) {
            newp[(newline.coords[k])] = newline.values[k];
        }
    }
    let moved = checkMoved (currentState.getPosition(), newp, direction);
    if (moved == false) {
        return;
    }
    score += scored
    let next = addRandom (newp)
    mergeCoords(merged)
    drawBoard (next);
}

//animação de combinação
function mergeCoords (mergedCoords) {
    const coords = mergedCoords
    coords.sort(function(a, b){return a - b});
    mergedAnimations = []
    let j = 0
    for (let i = 0; i < boardSize*boardSize; i++) {
        if (i == mergedCoords[j]) {
            mergedAnimations[i] = true
            j++
        }
        else {
            mergedAnimations[i] = false
        }
    }
    return mergedAnimations
}
//nome da animação no stylesheet
function mergeAnimations(value) {
    const aniNames = ["none", "to4", "to8", "to16", "to32", "to64", "to128", "to256", "to512", "to1024", "to2048", "tohigher"]
    if (value > aniNames.length) {
        return "tohigher2"
    }
    return aniNames[(value - 1)]
}
function moveAnimations(anvalue) {
    const animationName = ["none", "toLeft", "upward", "downward", "toRight", "new"]
    return animationName[anvalue]
}

//desfazer jogada
function undo () {
    previous.createBoard()
}

//inicia jogo padrão 4x4 ou jogo salvo se houver
function saved () {
    let save = localStorage.getItem('save')
	console.log(save)
    if (save == null) {
        resetBoard (4)
    }
    else {
        let parsed = JSON.parse(save)
        highScore = localStorage.getItem(getHighScore(parsed.size))
        let state = new gameState(parsed.position, parsed.animation, parsed.score, parsed.size, parsed.count)
        state.createBoard()
    }
}
//id das pontuações maximas em cache
function getHighScore (size) {
    let hscore4 = 'high4'
    let hscore3 = 'high3'
    let hscore5 = 'high5'
    let hscore6 = 'high6'
    let hscore = {
        3: hscore3,
        4: hscore4,
        5: hscore5,
        6: hscore6
    }

    return hscore[size]
}

//detecta linha bloqueada
function possibleMove (all) {  
    let startingValues = all;
    for (let i = 0; i < startingValues.length; i++) {
        if (startingValues[i] == 0) {
            return true;
        }
        if (startingValues[i] == startingValues[i+1]) {
            return true;
        }
    }
    return false
}
//salva estado e detecta mudanças, ou retorna (false)
function checkMoved (pos1, pos2, direction) {
    let moved = [];
    const prevPos = [];
    const prevAn = [];
    const prevScore = score
    animated = []
    for (let i = 0; i < pos1.length; i++) {
        animated.push(0)
        prevPos[i] = (pos1[i]);
        prevAn.push(0);
    }
    const prev = new gameState(prevPos, prevAn, prevScore, boardSize, moveCount)
    for (let i = 0; i < pos1.length; i++) {
        if (pos2[i] != prevPos[i]) {
            moved.push(i);
            if (pos2[i] != 0) {
                animated[i] = direction;
            }
        }
    }
    if (moved.length == 0) {
        return false;
    }
    previous = prev
    return moved;

}
//retorna células vazias 
function checkFree (position) {
    let empty = [];
    for (let i = 0; i < position.length; i++) {
        if (position[i] == 0) {
            empty.push(i);
        }
    }
    if (empty.length == 0) {
        return false;
    } 
    else {
        return empty;
    }
}
//detecta fim de jogo
function canMove (position) {
    let canMerge = false;
    //casa livre

    if ((checkFree(position)) !== false) {
        return true
    }
    else { 
    //esquerda
    for (let i = 0; i < boardSize; i++) {
        let val = [];
        let coo = [];
        for (let j = 0; j < boardSize; j++) {
            let ncoord = (i*boardSize) + j;
            val[j] = position[ncoord];
            coo[j] = ncoord;
        }
        if (possibleMove(val) == true) {
            canMerge = true;
        }
    }
    //direita
    for (let i = 0; i < boardSize; i++) {
        let val = [];
        let coo = [];
        for (let j = 0; j < boardSize; j++) {
            let ncoord = (i*boardSize) + (boardSize-(j+1));
            val[j] = position[ncoord];
            coo[j] = ncoord;
        }
        if (possibleMove(val) == true) {
            canMerge = true;
        }
    }
    //cima
    for (let i = 0; i < boardSize; i++) {
        let val = [];
        let coo = [];
        for (let j = 0; j < boardSize; j++) {
            let ncoord = (j*boardSize) + i;
            val[j] = position[ncoord];
            coo[j] = ncoord;
        }
        if (possibleMove(val) == true) {
            canMerge = true;
        }
    }
    //baixo
    for (let i = 0; i < boardSize; i++) {
        let val = [];
        let coo = [];
        for (let j = 0; j < boardSize; j++) {
            let ncoord = ((boardSize-(j+1))*boardSize) + i;
            val[j] = position[ncoord];
            coo[j] = ncoord;
        }
        if (possibleMove(val) == true) {
            canMerge = true;
        }
    }
}
    return canMerge
}
//insere célula aleatória
function addRandom (position) {
    let empty = checkFree (position)
    let newValue;
    let newPosition = [];
    let randomValMod = Math.ceil(4*(Math.random()));
        switch (randomValMod) {
            case 1: 
                newValue = 2;
                break;
            default:
                newValue = 1;
        }
    let randomSqMod = Math.round(Math.random()*(empty.length - 1));
    let newSq = empty[randomSqMod]
    for (let i = 0; i < position.length; i++) {
        if (i == newSq) {
            newPosition.push(newValue)
        }
        else {
            newPosition.push(position[i])
        }
    }
//    console.log(newSq)
    animated[newSq] = 5
    return newPosition;
}

//controles setas
window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case "ArrowLeft":
            move (currentState.getPosition(), 1)
            break;
        case "ArrowUp":
            move (currentState.getPosition(), 2)
            break;
        case "ArrowDown":
            move (currentState.getPosition(), 3)
            break;
        case "ArrowRight":
            move (currentState.getPosition(), 4)
            break;
        default:

            break;
    }
})
//controle virtual
document.getElementById("left").addEventListener("click", function () {
	move(currentState.getPosition(), 1)
});
document.getElementById("up").addEventListener("click", function () {
	move(currentState.getPosition(), 2)
});
document.getElementById("down").addEventListener("click", function () {
	move(currentState.getPosition(), 3)
});
document.getElementById("right").addEventListener("click", function () {
	move(currentState.getPosition(), 4)
});
//controles touch
document.addEventListener('touchstart', (evt) => {

    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
}       );   
document.addEventListener('touchmove', (evt) => {
    evt.preventDefault();
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
        if ( xDiff > 0 ) {
            move(currentState.getPosition(), 1);
        } 
        else {
            move(currentState.getPosition(), 4);
        } 
    }                     
    else {
        if ( yDiff > 0 ) {
            move(currentState.getPosition(), 2);
        } 
        else { 
            move(currentState.getPosition(), 3)
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
});
var xDown = null;                                                        
var yDown = null;
function getTouches(evt) {
  return evt.touches ||             
         evt.originalEvent.touches; 
}        

//ajuste automático de tamanho
function zoom() {
	let dw = (screen.width)
    let ww = wrapper.offsetWidth + 16
    let vc = document.getElementById('vcontrols')
    vc.style.width = ww + 'px';
		if ((dw < 600)) {
			let zoomlevel = dw/ww;
//			wrapper.style.MozTransform = 'scale(' + zoomlevel + ')';
//			wrapper.style.WebkitTransform = 'scale(' + zoomlevel + ')';
            wrapper.style.transform = 'scale(' + zoomlevel + ')';
            vc.style.width = ((ww-16)*zoomlevel) + 'px';
            header.style.width = ((ww-16)*zoomlevel) + 'px';
            vc.style.transform = 'translateY(' + (100 - (100/zoomlevel)) + 'vw)';
	}  
}
saved()
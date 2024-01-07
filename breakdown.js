
let score;
let marked;

const width = 25;
let height = 30;
const tile = 24;
const border = 4;
let kovlvl = 3;
let timeleft = 50;

const table = [];
let audio = new Audio('message-incoming-132126.mp3');
let background_music = new Audio('background_music.mp3');


const canvas = document.getElementById('canvas');
const content = canvas.getContext('2d');

// pontok generálása, 3 kocka 1 pont, 4 kocka 4 pont, 5 kocka 9 pont... , (m-2)^2 képlet alapján
function pont(){
    return Math.pow(marked-2,2);
}

// a kocka helyzete, ha ki van törölve akkor 0 egyéb esetben egy pozitív szám amely a helyzetét jelzi
function state(x,y){
    if(x<0||y<0||x>width-1||y>height-1){
        return 0;
    } else {
        return table[width*y+x];
    }
}


//a játék resetelése random elemekkel, alapértelmezetten új játékteret épít fel
function reset(f = () => !(marked = score = 0) && Math.floor(Math.random() * kovlvl + 1)){
    for (let v = width * height; v--;){
        table[v] = f(table[v]);
    }
}

// kocka rajzolásának kiszervezése könnyebb átláthatóság miatt
function rect (color, x, y, width, height){
    const color1 = ['#FCA311', '#14213D', '#E5E5E5','#FF8427', '#840032', '#8b3bd1' ];
    content.fillStyle = color1[color];
    content.fillRect(x,y,width,height);
}

function draw(){
    // a kockák kirajzolása
    for (let i = width;i--;){
        for (let j = height;j--;){
            let c = Math.abs(state(i,j));
            let x = i * tile+border;
            let y = j * tile+border;
            rect(c, x, y, tile,tile);
        }
    }
}

// egyforma színű kockák összegyűjtése, ha törölt vagy egyéb színű akkor megáll különben rekurzívan vizsgáálja tovább
function mark (x,y,c){
   if (state(x,y) <= 0 || c != state(x,y)){
       return 0;
   } else {
       table[width*y+x] = -c;
       return 1 + mark(x - 1, y, c) + mark(x, y - 1, c) + mark(x + 1, y, c) + mark(x, y + 1, c);
   }
}
// a kockák helyzetének felcserélése
function swap(x1,y1,x2,y2){
    let alap = width * y1 + x1;
    let next = width * y2 + x2;
    let temp = table[alap];
    table[alap] = table[next];
    table[next] = temp;
}

reset();
draw();
let score_temp = score;
canvas.addEventListener('mousedown', function (event){
        let c = canvas.getBoundingClientRect();
        let j = event.clientX - c.left;
        let k = event.clientY - c.top;

        //az egér kattintása helyzetének átalakítása a kockák koordinátáira
        j = j < border ? -1 : Math.floor((j - border) / tile);
        k = k < border ? -1 : Math.floor((k - border) / tile);


        if (state(j,k) < 0 && marked > 1){

            // kijelölt kockák törlése
           reset(v => v < 0 ? 0 : v);

           // a kockák lecsúsztatása törlés után
            for (j = width; j--;){
                for (c = true; c;){
                    for (c = false, k = 1; k < height; k++){
                        if (!state(j,k) && state(j,k-1)){
                            swap(j,k,j,k-1,c = true);
                        }
                    }
                }
            }

            // a kockák jobbra tolása ha egy oszlop teljesen törlődik
            for (c = true; c;){
                for (c = false, j = 1; j < width; j++){
                    if (!state(j-1, height-1) && state(j, height-1)){
                        for (c = true, k = height; k--;){
                            swap(j,k,j-1,k);
                        }
                    }
                }
            }

            //let score_temp = score;
            score += pont();

            if (score >= score_temp){
                audio.volume= 0.5;
                audio.play();
            }

        }


        reset(Math.abs);

        //kattintásra kijelölni az adott kockát és a vele azonos színűeket
        marked = marked < 0 ? marked : mark(j, k, state(j, k));

        draw();

});

const gameover = document.querySelector('#gameover');

function ok(){
 const info = document.querySelector('#info');
 info.style.display = 'none';
}

//névbeírás és pontszám elmentése localstorage-be
function form(){
    let form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action" , "submit");
    ido.appendChild(form);
    let nameTag = document.createElement('label');
    let btnTag = document.createElement('label');
    let name = document.createElement("input");
    name.setAttribute("placeholder", "játékos név: ");
    name.setAttribute("id", "name");
    nameTag.innerHTML = "Név: ";
    name.appendChild(nameTag);
    let submitBtn = document.createElement("button");
    submitBtn.onclick = function (){let uname = document.getElementById("name").value; localStorage.setItem(uname, score);};
    btnTag.innerHTML = "Submit";
    submitBtn.appendChild(btnTag);
    form.appendChild(nameTag);
    form.appendChild(name);
    form.appendChild(submitBtn);
}

// következő szint
function nextlvl() {
    timeleft = 50;
    kovlvl += 1;
    height = 30;
    gameover.style.display = 'none';
    score = 0;
    Timer = setInterval(time, 1000);
    reset();
    draw();
}

//toplista kiírása a game over felöleten
function toplista(){
    let toplista =document.getElementById('toplista');
    for (let i = localStorage.length;i--;){
        let nevek= localStorage.key(i);
        let pontok = localStorage.getItem(nevek);
        let li = document.createElement('li')
        li.innerText = 'Név: ' + nevek + ' Pont: ' + pontok;
        toplista.appendChild(li);
    }

}

// idő mérése és ehhez kapcsolódó funkciók

function time(){
    //idő lejártakor
    if(timeleft <= 0){
        clearInterval(Timer);
        let ido = document.getElementById("ido")
        ido.innerHTML = "GAME OVER,   pontszám: " + score;
        form();
        gameover.style.display= 'block';
        toplista();

    } else {
        document.getElementById("ido").innerHTML = timeleft + " mp maradt, pontszám: "+ score;
        background_music.play();
        background_music.loop = true;
        background_music.volume = 0.2;


        if (timeleft === 25){
            height += 1;
            for (let w = width;w--;){
                table.push(Math.floor(Math.random() * kovlvl+1))
            }
            draw();

        }
        if (timeleft === 13){
            height += 1;
            for (let w = width;w--;){
                table.push(Math.floor(Math.random() * kovlvl+1 ))
            }
            draw();
        }
        if (timeleft === 5){
            height += 1;
            for (let w = width;w--;){
                table.push(Math.floor(Math.random() * kovlvl+1 ))
            }
            draw();
        }


    }
    timeleft -= 1;
}
 let Timer = setInterval(time, 1000);






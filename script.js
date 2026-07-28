/*=========================================================
    MISSION 500M - FINAL VERSION
    SCRIPT.JS
    PART 1/4
=========================================================*/

const TARGET = 500000000;

const API_URL = "https://script.google.com/macros/s/AKfycby1Duo1YkcLcoqVSFNIi3PNYCu2R6P4NFUSOgA4CmAQHMM4WTbtK6iZUrJND_XzhSne/exec";

const REFRESH_TIME = 5000;

/*=========================================================
    DOM
=========================================================*/

const moneyElement = document.getElementById("money");
const percentElement = document.getElementById("percent");

const dino = document.getElementById("dino");
const bar = document.getElementById("bar");

const popup = document.getElementById("popup");
const popupStore = document.getElementById("popupStore");
const popupMoney = document.getElementById("popupMoney");

const leaderboard = document.getElementById("leaderboard");

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

/*=========================================================
    GLOBAL
=========================================================*/

let totalSale = 0;
let currentMoney = 0;

let lastOrderId = "";

let fired100 = false;
let fired250 = false;
let fired500 = false;

let popupTimer = null;

let particles = [];

/*=========================================================
    FORMAT MONEY
=========================================================*/

function formatMoney(value){

    return Number(value || 0).toLocaleString("vi-VN") + " ₫";

}

/*=========================================================
    ANIMATE MONEY
=========================================================*/

function animateMoney(target){

    const start = currentMoney;

    const duration = 800;

    const startTime = performance.now();

    function frame(now){

        const progress =
            Math.min((now-startTime)/duration,1);

        currentMoney =
            start + (target-start)*progress;

        moneyElement.innerHTML =
            formatMoney(currentMoney);

        if(progress < 1){

            requestAnimationFrame(frame);

        }

    }

    requestAnimationFrame(frame);

}

/*=========================================================
    UPDATE KPI
=========================================================*/

function updateProgress(total){

    totalSale = Number(total)||0;

    animateMoney(totalSale);

    const percent =
        Math.min(totalSale/TARGET*100,100);

    percentElement.innerHTML =
        percent.toFixed(1)+"%";

    bar.style.width =
        percent+"%";

    dino.style.left =
        `calc(${percent}% - 45px)`;

}
/*=========================================================
    PART 2/4
    POPUP + LEADERBOARD + FIREWORK
=========================================================*/

/*=========================================================
    POPUP
=========================================================*/

function showPopup(store, amount){

    popupStore.textContent = store;
    popupMoney.textContent = formatMoney(amount);

    popup.classList.add("show");

    clearTimeout(popupTimer);

    popupTimer = setTimeout(() => {

        popup.classList.remove("show");

    },4000);

}

/*=========================================================
    LEADERBOARD
=========================================================*/

function updateLeaderboard(orders){

    const dealers = {};

    orders.forEach(item=>{

        const store = item.store || "Không xác định";

        if(!dealers[store]){

            dealers[store]=0;

        }

        dealers[store]+=Number(item.amount)||0;

    });

    const ranking =
        Object.entries(dealers)
        .sort((a,b)=>b[1]-a[1])
        .slice(0,10);

    if(ranking.length===0){

        leaderboard.innerHTML=`
            <tr>
                <td colspan="3">
                    Chưa có dữ liệu
                </td>
            </tr>
        `;

        return;

    }

    let html="";

    ranking.forEach((item,index)=>{

        html+=`
        <tr>
            <td>${index+1}</td>
            <td>${item[0]}</td>
            <td>${formatMoney(item[1])}</td>
        </tr>
        `;

    });

    leaderboard.innerHTML=html;

}

/*=========================================================
    CANVAS
=========================================================*/

function resizeCanvas(){

    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;

}

window.addEventListener("resize",resizeCanvas);

resizeCanvas();

/*=========================================================
    FIREWORK
=========================================================*/

function createFirework(){

    for(let i=0;i<100;i++){

        particles.push({

            x:canvas.width/2,

            y:canvas.height/2,

            dx:(Math.random()-0.5)*12,

            dy:(Math.random()-0.5)*12,

            size:Math.random()*4+2,

            life:100

        });

    }

}

function drawFireworks(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    particles.forEach((p,index)=>{

        ctx.beginPath();

        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);

        ctx.fillStyle=
            `hsl(${Math.random()*360},100%,60%)`;

        ctx.fill();

        p.x+=p.dx;

        p.y+=p.dy;

        p.dy+=0.05;

        p.life--;

        if(p.life<=0){

            particles.splice(index,1);

        }

    });

    requestAnimationFrame(drawFireworks);

}

drawFireworks();

function firework(){

    createFirework();

}
/*=========================================================
    PART 3/4
    LOAD DATA + MILESTONE
=========================================================*/

/*=========================================================
    CHECK MILESTONE
=========================================================*/

function checkMilestone(){

    if(totalSale>=100000000 && !fired100){

        fired100=true;

        firework();

    }

    if(totalSale>=250000000 && !fired250){

        fired250=true;

        firework();

    }

    if(totalSale>=500000000 && !fired500){

        fired500=true;

        firework();

        alert("🎉 MISSION 500 TRIỆU ĐÃ HOÀN THÀNH!");

    }

}

/*=========================================================
    LOAD DATA FROM APPS SCRIPT
=========================================================*/

async function loadData(){

    try{

        const response = await fetch(
            API_URL + "?t=" + Date.now(),
            {
                cache:"no-store"
            }
        );

        if(!response.ok){

            throw new Error("Không lấy được dữ liệu");

        }

        const data = await response.json();

        updateProgress(Number(data.total)||0);

        updateLeaderboard(data.orders||[]);

        checkMilestone();

        if(data.orders && data.orders.length){

            const last =
                data.orders[data.orders.length-1];

            const orderId =
                `${last.time}_${last.store}_${last.amount}`;

            if(orderId!==lastOrderId){

                lastOrderId=orderId;

                showPopup(
                    last.store,
                    Number(last.amount)
                );

            }

        }

    }

    catch(err){

        console.error(err);

    }

}

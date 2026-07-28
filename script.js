/*=========================================================
    MISSION 500M
    FINAL VERSION
=========================================================*/

const TARGET = 500000000;

const API_URL =
"https://script.google.com/macros/s/AKfycby1Duo1YkcLcoqVSFNIi3PNYCu2R6P4NFUSOgA4CmAQHMM4WTbtK6iZUrJND_XzhSne/exec";

const REFRESH_TIME = 5000;

/*=========================================================
    DOM
=========================================================*/

const moneyElement = document.getElementById("money");
const percentElement = document.getElementById("percent");

const bar = document.getElementById("bar");
const dino = document.getElementById("dino");

const popup = document.getElementById("popup");
const popupStore = document.getElementById("popupStore");
const popupMoney = document.getElementById("popupMoney");

const leaderboard =
document.getElementById("leaderboard");

const canvas =
document.getElementById("fireworks");

const ctx =
canvas.getContext("2d");

/*=========================================================
    GLOBAL
=========================================================*/

let totalSale = 0;

let currentMoney = 0;

let lastOrderId = null;

let fired100 = false;
let fired250 = false;
let fired500 = false;

let popupTimer = null;

let particles = [];

/*=========================================================
    FORMAT
=========================================================*/

function formatMoney(value){

    return Number(value || 0)
    .toLocaleString("vi-VN") + " ₫";

}

/*=========================================================
    MONEY ANIMATION
=========================================================*/

function animateMoney(target){

    const start = currentMoney;

    const duration = 800;

    const startTime = performance.now();

    function frame(now){

        const progress =
        Math.min(
            (now-startTime)/duration,
            1
        );

        currentMoney =
        start + (target-start)*progress;

        moneyElement.textContent =
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

    totalSale = Number(total) || 0;

    animateMoney(totalSale);

    const percent =
    Math.min(
        totalSale/TARGET*100,
        100
    );

    percentElement.textContent =
    percent.toFixed(1) + "%";

    bar.style.width =
    percent + "%";

    dino.style.left =
    `calc(${percent}% - 40px)`;

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

    popupTimer = setTimeout(()=>{

        popup.classList.remove("show");

    },4000);

}

/*=========================================================
    LEADERBOARD
=========================================================*/

function updateLeaderboard(orders){

    const dealers = {};

    orders.forEach(item=>{

        const name = item.store || "Không xác định";

        if(!dealers[name]){

            dealers[name]=0;

        }

        dealers[name]+=Number(item.amount)||0;

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
    FIREWORK CANVAS
=========================================================*/

function resizeCanvas(){

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;

}

window.addEventListener("resize",resizeCanvas);

resizeCanvas();

/*=========================================================
    CREATE PARTICLES
=========================================================*/

function createFirework(){

    for(let i=0;i<120;i++){

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

/*=========================================================
    DRAW FIREWORK
=========================================================*/

function drawFireworks(){

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

    particles = particles.filter(p=>p.life>0);

    particles.forEach(p=>{

        ctx.beginPath();

        ctx.arc(

            p.x,

            p.y,

            p.size,

            0,

            Math.PI*2

        );

        ctx.fillStyle=

        `hsl(${Math.random()*360},100%,60%)`;

        ctx.fill();

        p.x+=p.dx;

        p.y+=p.dy;

        p.dy+=0.05;

        p.life--;

    });

    requestAnimationFrame(drawFireworks);

}

drawFireworks();

/*=========================================================
    FIREWORK
=========================================================*/

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

    }

}

/*=========================================================
    LOAD DATA
=========================================================*/

async function loadData(firstLoad=false){

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

        const orders = data.orders || [];

        updateProgress(Number(data.total)||0);

        updateLeaderboard(orders);

        checkMilestone();

        if(orders.length===0){

            return;

        }

        const last = orders[orders.length-1];

        const orderId =

            `${last.time}_${last.store}_${last.amount}`;

        /*==============================
            LẦN MỞ ĐẦU
            KHÔNG HIỆN POPUP
        ==============================*/

        if(firstLoad){

            lastOrderId = orderId;

            return;

        }

        /*==============================
            CHỈ POPUP KHI CÓ ĐƠN MỚI
        ==============================*/

        if(lastOrderId===null){

            lastOrderId = orderId;

            return;

        }

        if(orderId!==lastOrderId){

            lastOrderId = orderId;

            showPopup(

                last.store,

                Number(last.amount)

            );

        }

    }

    catch(error){

        console.error(

            "Lỗi kết nối:",

            error

        );

    }

}
/*=========================================================
    PART 4/4
    START SYSTEM
=========================================================*/

/*=========================================================
    RESET MILESTONE
=========================================================*/

function resetMilestone(){

    fired100 = totalSale >= 100000000;

    fired250 = totalSale >= 250000000;

    fired500 = totalSale >= 500000000;

}

/*=========================================================
    AUTO REFRESH
=========================================================*/

let refreshTimer = null;

function startAutoRefresh(){

    if(refreshTimer){

        clearInterval(refreshTimer);

    }

    refreshTimer = setInterval(async()=>{

        await loadData(false);

    },REFRESH_TIME);

}

/*=========================================================
    START DASHBOARD
=========================================================*/

async function startDashboard(){

    try{

        /* Lần đầu chỉ tải dữ liệu,
           KHÔNG popup */

        await loadData(true);

        resetMilestone();

        startAutoRefresh();

        console.log("MISSION 500M READY");

    }

    catch(error){

        console.error(error);

    }

}

/*=========================================================
    ONLINE / OFFLINE
=========================================================*/

window.addEventListener("online",()=>{

    console.log("Đã kết nối Internet");

    loadData(false);

});

window.addEventListener("offline",()=>{

    console.log("Mất kết nối Internet");

});

/*=========================================================
    START
=========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        startDashboard();

    }

);

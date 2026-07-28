/*=========================================================
        MISSION 500M
        SCRIPT.JS
        PART 1
=========================================================*/

const TARGET = 500000000;

/* Dán URL Apps Script vào đây */

const API_URL = "https://script.google.com/macros/s/AKfycby1Duo1YkcLcoqVSFNIi3PNYCu2R6P4NFUSOgA4CmAQHMM4WTbtK6iZUrJND_XzhSne/exec";

/*=========================================================
        DOM
=========================================================*/

const moneyElement=document.getElementById("money");
const percentElement=document.getElementById("percent");

const dino=document.getElementById("dino");
const bar=document.getElementById("bar");

const popup=document.getElementById("popup");
const popupStore=document.getElementById("popupStore");
const popupMoney=document.getElementById("popupMoney");

const leaderboard=document.getElementById("leaderboard");

/*=========================================================
        GLOBAL
=========================================================*/

let totalSale=0;

let currentMoney=0;

let lastOrderId="";

let fired100=false;
let fired250=false;
let fired500=false;

/*=========================================================
        FORMAT
=========================================================*/

function money(number){

    return Number(number)
    .toLocaleString("vi-VN")+" ₫";

}

/*=========================================================
        COUNT UP
=========================================================*/

function animateMoney(target){

    const start=currentMoney;

    const duration=900;

    const startTime=performance.now();

    function update(now){

        const progress=Math.min(
            (now-startTime)/duration,
            1
        );

        currentMoney=
            start+(target-start)*progress;

        moneyElement.innerHTML=
            money(currentMoney);

        if(progress<1){

            requestAnimationFrame(update);

        }

    }

    requestAnimationFrame(update);

}

/*=========================================================
        UPDATE KPI
=========================================================*/

function updateProgress(total){

    totalSale=total;

    animateMoney(total);

    const percent=
        Math.min(
            total/TARGET*100,
            100
        );

    percentElement.innerHTML=
        percent.toFixed(1)+"%";

    bar.style.width=
        percent+"%";

    dino.style.left=
        "calc("+percent+"% - 50px)";

}
/*=========================================================
        SCRIPT.JS
        PART 2
=========================================================*/

/*=========================================================
        POPUP
=========================================================*/

function showPopup(store, amount){

    popupStore.innerHTML = store;

    popupMoney.innerHTML = money(amount);

    popup.classList.add("show");

    clearTimeout(window.popupTimer);

    window.popupTimer = setTimeout(() => {

        popup.classList.remove("show");

    },4000);

}

/*=========================================================
        LEADERBOARD
=========================================================*/

function updateLeaderboard(orders){

    const dealer={};

    orders.forEach(item=>{

        if(!dealer[item.store]){

            dealer[item.store]=0;

        }

        dealer[item.store]+=Number(item.amount);

    });

    const list=Object.entries(dealer)

        .sort((a,b)=>b[1]-a[1])

        .slice(0,10);

    let html="";

    list.forEach((item,index)=>{

        html+=`
        <tr>
            <td>${index+1}</td>
            <td>${item[0]}</td>
            <td>${money(item[1])}</td>
        </tr>`;

    });

    if(html===""){

        html=`
        <tr>
            <td colspan="3">
                Chưa có dữ liệu
            </td>
        </tr>`;

    }

    leaderboard.innerHTML=html;

}

/*=========================================================
        FIREWORK
=========================================================*/

function firework(text){

    console.log("🎉 "+text);

}

/*=========================================================
        CHECK MILESTONE
=========================================================*/

function checkMilestone(){

    if(totalSale>=100000000 && !fired100){

        fired100=true;

        firework("Đạt 100 triệu");

    }

    if(totalSale>=250000000 && !fired250){

        fired250=true;

        firework("Đạt 250 triệu");

    }

    if(totalSale>=500000000 && !fired500){

        fired500=true;

        firework("MISSION COMPLETE");

    }

}

/*=========================================================
        LOAD DATA
=========================================================*/

async function loadData(){

    // DEMO MODE

    if(API_URL==="PASTE_YOUR_APPS_SCRIPT_URL_HERE"){

        demoMode();

        return;

    }

    try{

        const response=

            await fetch(API_URL);

        const data=

            await response.json();

        updateProgress(data.total);

        updateLeaderboard(data.orders);

        checkMilestone();

        if(data.orders.length>0){

            const last=

                data.orders[data.orders.length-1];

            const orderId=

                last.time+
                last.store+
                last.amount;

            if(orderId!==lastOrderId){

                lastOrderId=orderId;

                showPopup(
                    last.store,
                    last.amount
                );

            }

        }

    }

    catch(error){

        console.log(error);

    }

}
/*=========================================================
        SCRIPT.JS
        PART 3 (FINAL)
=========================================================*/

/*=========================================================
        SIMPLE FIREWORK
=========================================================*/

const canvas=document.getElementById("fireworks");
const ctx=canvas.getContext("2d");

function resizeCanvas(){

    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;

}

window.addEventListener("resize",resizeCanvas);

resizeCanvas();

let particles=[];

function createFirework(){

    for(let i=0;i<80;i++){

        particles.push({

            x:canvas.width/2,

            y:canvas.height/2,

            dx:(Math.random()-0.5)*10,

            dy:(Math.random()-0.5)*10,

            life:100,

            size:Math.random()*4+2

        });

    }

}

function drawFirework(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    particles.forEach((p,index)=>{

        ctx.beginPath();

        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);

        ctx.fillStyle=`hsl(${Math.random()*360},100%,60%)`;

        ctx.fill();

        p.x+=p.dx;

        p.y+=p.dy;

        p.dy+=0.05;

        p.life--;

        if(p.life<=0){

            particles.splice(index,1);

        }

    });

    requestAnimationFrame(drawFirework);

}

drawFirework();

function firework(text){

    console.log(text);

    createFirework();

}

/*=========================================================
        DEMO MODE
=========================================================*/

let demoRunning=false;

function demoMode(){

    if(demoRunning) return;

    demoRunning=true;

    const dealerNames=[

        "Forza Hà Nội",
        "Forza Đà Nẵng",
        "Forza Hải Phòng",
        "Forza Nghệ An",
        "Forza Thanh Hóa",
        "Forza Quảng Ninh",
        "Forza Bắc Ninh",
        "Forza HCM",
        "Forza Bình Dương",
        "Forza Cần Thơ"

    ];

    let orders=[];

    function randomOrder(){

        const amount=

            Math.floor(
                Math.random()*18000000
            )+3000000;

        totalSale+=amount;

        if(totalSale>TARGET){

            totalSale=TARGET;

        }

        const store=

            dealerNames[
                Math.floor(
                    Math.random()*dealerNames.length
                )
            ];

        orders.push({

            store:store,

            amount:amount,

            time:Date.now()

        });

        updateProgress(totalSale);

        updateLeaderboard(orders);

        showPopup(store,amount);

        checkMilestone();

    }

    randomOrder();

    setInterval(randomOrder,6000);

}

/*=========================================================
        AUTO REFRESH
=========================================================*/

loadData();

setInterval(loadData,5000);

/*=========================================================
        START
=========================================================*/

console.log("MISSION 500M READY");

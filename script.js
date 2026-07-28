const TARGET = 500000000;

// Tạm thời giả lập dữ liệu
let total = 125000000;

function updateDashboard(){

    let percent = total / TARGET * 100;

    document.querySelector(".money").innerHTML =
        total.toLocaleString("vi-VN")+" ₫";

    document.querySelector(".bar").style.width =
        percent+"%";

}

updateDashboard();

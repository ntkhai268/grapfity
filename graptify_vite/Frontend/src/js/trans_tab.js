import { initWaveSurfer } from "./waveform";

console.log("trans_tab.js đã chạy!");

let retryCount = 0;
const MAX_RETRIES = 10; // Giới hạn số lần thử

function initTabs() {
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".content");
    const leftSection = document.querySelector(".left_section");

    if (!tabs.length || !contents.length || !leftSection) {
        retryCount++;
        if (retryCount > MAX_RETRIES) {
            console.error("trans_tab.js: Quá số lần thử, dừng lại!");
            return;
        }
        console.warn(`trans_tab.js: Chưa tìm thấy phần tử cần thiết (${retryCount}/${MAX_RETRIES}). Chờ thử lại...`);
        setTimeout(initTabs, 500);
        return;
    }

    const tabColors = {
        all: "#121212",
        popular: "#121212",
        track: "#121212",
        playlist: "#121212"
    };

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            this.classList.add("active");
            const tabType = this.getAttribute("data-tab");
            document.querySelector(`.content.${tabType}`).classList.add("active");

            leftSection.style.backgroundColor = tabColors[tabType] || "#121212";

            // Khi chuyển tab, kiểm tra và khởi tạo sóng âm cho tab mới
            setTimeout(() => {
                if (typeof initWaveSurfer === "function") {
                    initWaveSurfer(); // Gọi từ waveform.js
                } else {
                    console.warn("initWaveSurfer chưa được định nghĩa!");
                }
            }, 100);
        });
    });

    console.log("trans_tab.js đã được khởi tạo!");
}

document.addEventListener("DOMContentLoaded", initTabs);

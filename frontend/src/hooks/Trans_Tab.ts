import { initWaveSurfer } from "./waveform"; // Giữ nguyên import

console.log("trans_tab.ts đã chạy!");

let retryCount: number = 0;
const MAX_RETRIES: number = 10; // Giới hạn số lần thử

function initTabs(): void {
    // Sử dụng kiểu dữ liệu cụ thể hơn cho các phần tử DOM
    const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".tab");
    const contents: NodeListOf<HTMLElement> = document.querySelectorAll(".content");
    // leftSection có thể null nếu không tìm thấy
    const leftSection: HTMLElement | null = document.querySelector(".left_section");

    // Kiểm tra chặt chẽ hơn, bao gồm cả leftSection
    if (!tabs.length || !contents.length || !leftSection) {
        retryCount++;
        if (retryCount > MAX_RETRIES) {
            console.error("trans_tab.ts: Quá số lần thử, dừng lại!");
            return;
        }
        console.warn(`trans_tab.ts: Chưa tìm thấy phần tử cần thiết (${retryCount}/${MAX_RETRIES}). Chờ thử lại...`);
        // Sử dụng window.setTimeout để rõ ràng hơn về phạm vi
        window.setTimeout(initTabs, 500);
        return;
    }

    // Định nghĩa kiểu cho tabColors để rõ ràng hơn
    interface TabColors {
        [key: string]: string; // Cho phép bất kỳ key string nào, giá trị là string
        all: string;
        popular: string;
        track: string;
        playlist: string;
    }

    const tabColors: TabColors = {
        all: "#121212",
        popular: "#121212",
        track: "#121212",
        playlist: "#121212"
    };

    tabs.forEach(tab => {
        // Thêm kiểu sự kiện MouseEvent
        tab.addEventListener("click", function (event: MouseEvent) {
            // Đảm bảo 'this' trong ngữ cảnh này là một HTMLElement
            const currentTab = event.currentTarget as HTMLElement;

            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            currentTab.classList.add("active");
            const tabType = currentTab.getAttribute("data-tab");

            // Kiểm tra tabType có tồn tại không
            if (tabType) {
                const activeContent = document.querySelector(`.content.${tabType}`) as HTMLElement | null;
                // Kiểm tra activeContent có tồn tại không trước khi thêm class
                if (activeContent) {
                    activeContent.classList.add("active");
                } else {
                    console.warn(`trans_tab.ts: Không tìm thấy content cho tab: ${tabType}`);
                }

                // Đặt màu nền, sử dụng || để cung cấp giá trị mặc định an toàn
                // leftSection đã được kiểm tra không null ở đầu hàm
                leftSection!.style.backgroundColor = tabColors[tabType] || "#121212";
            } else {
                 console.warn("trans_tab.ts: Thuộc tính data-tab không tồn tại trên tab:", currentTab);
            }


            // Khi chuyển tab, kiểm tra và khởi tạo sóng âm cho tab mới
            // Sử dụng window.setTimeout
            window.setTimeout(() => {
                // Giữ nguyên kiểm tra typeof vì initWaveSurfer được import từ JS
                // và có thể không được định nghĩa tại thời điểm chạy nếu có lỗi tải module
                if (typeof initWaveSurfer === "function") {
                    initWaveSurfer(); // Gọi từ waveform.js
                } else {
                    console.warn("initWaveSurfer chưa được định nghĩa hoặc không phải là hàm!");
                }
            }, 100);
        });
    });

    console.log("trans_tab.ts đã được khởi tạo!");
}

// Sử dụng sự kiện DOMContentLoaded như cũ
document.addEventListener("DOMContentLoaded", initTabs);
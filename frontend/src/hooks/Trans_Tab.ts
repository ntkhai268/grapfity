import { initWaveSurfer } from "./WaveForm"; // Giữ nguyên import

console.log("trans_tab.ts đã chạy!");

let retryCount: number = 0;
const MAX_RETRIES: number = 10;

// Chấp nhận tham số initialTab, mặc định là 'all'
export function initTabs(initialTab: string = 'all'): void {
    const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".tab");
    const contents: NodeListOf<HTMLElement> = document.querySelectorAll(".content");
    const leftSection: HTMLElement | null = document.querySelector(".left_section");

    // --- Logic tìm phần tử và thử lại (Giữ nguyên) ---
    if (!tabs.length || !contents.length || !leftSection) {
        retryCount++;
        if (retryCount > MAX_RETRIES) {
            console.error("trans_tab.ts: Quá số lần thử, dừng lại!");
            return;
        }
        console.warn(`trans_tab.ts: Chưa tìm thấy phần tử cần thiết (${retryCount}/${MAX_RETRIES}). Chờ thử lại...`);
        // Truyền lại initialTab khi thử lại
        window.setTimeout(() => initTabs(initialTab), 500);
        return;
    }
    // Reset retry count khi thành công tìm thấy phần tử
    retryCount = 0;
    // --- Kết thúc Logic tìm phần tử và thử lại ---


    interface TabColors {
        [key: string]: string;
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

    // ==============================================================
    // ===== BẮT ĐẦU LOGIC MỚI: THIẾT LẬP TRẠNG THÁI ACTIVE BAN ĐẦU =====
    // ==============================================================
    console.log(`trans_tab.ts: Đang thiết lập tab ban đầu được yêu cầu là: ${initialTab}`);

    let activeTabSet = false;
    let activeContentSet = false;
    let finalActiveTabType = 'all'; // Lưu lại loại tab thực sự được active

    // 1. Xóa class 'active' khỏi TẤT CẢ các tab và content trước khi thiết lập
    //    Điều này đảm bảo trạng thái active trong HTML gốc (nếu có) bị ghi đè.
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));
    console.log("trans_tab.ts: Đã xóa 'active' khỏi tất cả tabs và contents.");

    // 2. Tìm tab và content tương ứng với 'initialTab'
    const targetTabElement = document.querySelector(`.tab[data-tab="${initialTab}"]`) as HTMLElement | null;
    const targetContentElement = document.querySelector(`.content.${initialTab}`) as HTMLElement | null;

    // 3. Thêm 'active' vào tab và content tìm được
    if (targetTabElement) {
        targetTabElement.classList.add("active");
        activeTabSet = true;
        finalActiveTabType = initialTab; // Cập nhật loại tab thực sự active
        console.log(`trans_tab.ts: Đã đặt active cho tab:`, targetTabElement);
    } else {
        console.warn(`trans_tab.ts: Không tìm thấy nút tab [data-tab="${initialTab}"].`);
    }

    if (targetContentElement) {
        targetContentElement.classList.add("active");
        activeContentSet = true;
        console.log(`trans_tab.ts: Đã đặt active cho content:`, targetContentElement);
    } else {
        console.warn(`trans_tab.ts: Không tìm thấy content [class=".content.${initialTab}"].`);
    }

    // 4. Xử lý fallback nếu không tìm thấy tab hoặc content được yêu cầu
    if (!activeTabSet || !activeContentSet) {
        console.warn(`trans_tab.ts: Không thể kích hoạt đầy đủ "${initialTab}". Kích hoạt tab/content 'all' mặc định.`);
        finalActiveTabType = 'all'; // Quay về mặc định

        // Kích hoạt tab 'all' (hoặc tab đầu tiên nếu 'all' cũng không có)
        const fallbackTab = document.querySelector('.tab[data-tab="all"]') || tabs[0];
        if (fallbackTab instanceof HTMLElement && !activeTabSet) {
             // Chỉ thêm active nếu tab chưa được set thành công trước đó
            tabs.forEach(t => t.classList.remove("active")); // Xóa lại phòng trường hợp chỉ content bị lỗi
            fallbackTab.classList.add("active");
            console.log(`trans_tab.ts: Đã đặt active cho tab mặc định:`, fallbackTab);
            finalActiveTabType = fallbackTab.getAttribute('data-tab') || 'all';
        }

        // Kích hoạt content 'all' (hoặc content đầu tiên nếu 'all' cũng không có)
        const fallbackContent = document.querySelector('.content.all') || contents[0];
        if (fallbackContent instanceof HTMLElement && !activeContentSet) {
             // Chỉ thêm active nếu content chưa được set thành công trước đó
            contents.forEach(c => c.classList.remove("active")); // Xóa lại phòng trường hợp chỉ tab bị lỗi
            fallbackContent.classList.add("active");
            console.log(`trans_tab.ts: Đã đặt active cho content mặc định:`, fallbackContent);
        }
    }

    // 5. Cập nhật màu nền và gọi WaveSurfer cho tab active ban đầu (dù là yêu cầu hay fallback)
    leftSection!.style.backgroundColor = tabColors[finalActiveTabType] || "#121212";
    console.log(`trans_tab.ts: Đặt màu nền cho tab active ban đầu: ${finalActiveTabType}`);

    window.setTimeout(() => {
        if (typeof initWaveSurfer === "function") {
            console.log(`trans_tab.ts: Gọi initWaveSurfer lần đầu cho tab: ${finalActiveTabType}`);
            initWaveSurfer();
        } else {
            console.warn("trans_tab.ts: initWaveSurfer không phải là hàm khi khởi tạo!");
        }
    }, 100); // Delay nhỏ để đảm bảo content hiển thị

    // ==============================================================
    // ===== KẾT THÚC LOGIC MỚI: THIẾT LẬP TRẠNG THÁI ACTIVE BAN ĐẦU =====
    // ==============================================================


    // ==============================================================
    // ===== LOGIC GẮN SỰ KIỆN CLICK (Giữ nguyên như trước) =====
    // ==============================================================
    tabs.forEach(tab => {
        tab.addEventListener("click", function (event: MouseEvent) {
            const currentTab = event.currentTarget as HTMLElement;
            const tabType = currentTab.getAttribute("data-tab");

            console.log(`trans_tab.ts: Đã click tab: ${tabType}`);

            // 1. Xóa active khỏi tất cả
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            // 2. Thêm active vào tab được click
            currentTab.classList.add("active");

            // 3. Thêm active vào content tương ứng và xử lý khác
            if (tabType) {
                const activeContent = document.querySelector(`.content.${tabType}`) as HTMLElement | null;
                if (activeContent) {
                    activeContent.classList.add("active");
                    // Cập nhật màu nền
                    leftSection!.style.backgroundColor = tabColors[tabType] || "#121212";
                    // Gọi initWaveSurfer
                    window.setTimeout(() => {
                        if (typeof initWaveSurfer === "function") {
                            console.log(`trans_tab.ts: Gọi initWaveSurfer sau khi click tab: ${tabType}`);
                            initWaveSurfer();
                        } else {
                            console.warn("trans_tab.ts: initWaveSurfer không phải là hàm khi click!");
                        }
                    }, 100);
                } else {
                    console.warn(`trans_tab.ts: Không tìm thấy content cho tab: ${tabType}`);
                }
            } else {
                console.warn("trans_tab.ts: Thuộc tính data-tab không tồn tại trên tab:", currentTab);
            }
        });
    });
    // ==============================================================
    // ===== KẾT THÚC LOGIC GẮN SỰ KIỆN CLICK =====
    // ==============================================================

    console.log(`trans_tab.ts: Khởi tạo hoàn tất. Tab hoạt động ban đầu là: ${finalActiveTabType}`);
}
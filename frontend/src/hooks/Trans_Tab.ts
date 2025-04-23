import { initWaveSurfer } from "./WaveForm"; // Giữ nguyên import

console.log("trans_tab.ts đã chạy!");

let retryCount: number = 0;
const MAX_RETRIES: number = 10;

export function initTabs(): void {
  const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".tab");
  const contents: NodeListOf<HTMLElement> = document.querySelectorAll(".content");
  const leftSection: HTMLElement | null = document.querySelector(".left_section");

  if (!tabs.length || !contents.length || !leftSection) {
    retryCount++;
    if (retryCount > MAX_RETRIES) {
      console.error("trans_tab.ts: Quá số lần thử, dừng lại!");
      return;
    }
    console.warn(`trans_tab.ts: Chưa tìm thấy phần tử cần thiết (${retryCount}/${MAX_RETRIES}). Chờ thử lại...`);
    window.setTimeout(initTabs, 500);
    return;
  }

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

  tabs.forEach(tab => {
    tab.addEventListener("click", function (event: MouseEvent) {
      const currentTab = event.currentTarget as HTMLElement;

      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      currentTab.classList.add("active");
      const tabType = currentTab.getAttribute("data-tab");

      if (tabType) {
        const activeContent = document.querySelector(`.content.${tabType}`) as HTMLElement | null;
        if (activeContent) {
          activeContent.classList.add("active");
        } else {
          console.warn(`trans_tab.ts: Không tìm thấy content cho tab: ${tabType}`);
        }

        leftSection!.style.backgroundColor = tabColors[tabType] || "#121212";
      } else {
        console.warn("trans_tab.ts: Thuộc tính data-tab không tồn tại trên tab:", currentTab);
      }

      window.setTimeout(() => {
        if (typeof initWaveSurfer === "function") {
          initWaveSurfer();
        } else {
          console.warn("initWaveSurfer chưa được định nghĩa hoặc không phải là hàm!");
        }
      }, 100);
    });
  });

  console.log("trans_tab.ts đã được khởi tạo!");
}

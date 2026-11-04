import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Hook cho phép dùng chuột máy tính nhấn giữ và kéo (mouse drag to scroll)
 * trên các danh sách ScrollView / FlatList khi chạy trên nền tảng Web.
 */
export const useWebMouseDrag = () => {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;
    let scrollContainer: HTMLElement | null = null;
    let hasDragged = false;

    // Ngăn trình duyệt kéo bóng ảnh mặc định (ghost image drag)
    const onDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragstart', onDragStart);

    // Tìm thẻ cha có thanh cuộn (overflow: auto hoặc scroll)
    const findScrollable = (el: HTMLElement | null): HTMLElement | null => {
      while (el && el !== document.body && el !== document.documentElement) {
        const style = window.getComputedStyle(el);
        const canScrollX =
          (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
          el.scrollWidth > el.clientWidth;
        const canScrollY =
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          el.scrollHeight > el.clientHeight;

        if (canScrollX || canScrollY) {
          return el;
        }
        el = el.parentElement;
      }
      return null;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Chỉ nhận chuột trái
      const target = e.target as HTMLElement;

      // Không can thiệp vào các ô nhập liệu
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const container = findScrollable(target);
      if (!container) return;

      isDown = true;
      hasDragged = false;
      scrollContainer = container;
      startX = e.pageX;
      startY = e.pageY;
      scrollLeft = container.scrollLeft;
      scrollTop = container.scrollTop;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown || !scrollContainer) return;
      const dx = e.pageX - startX;
      const dy = e.pageY - startY;

      // Nếu di chuyển quá 4px thì bắt đầu cuộn
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasDragged = true;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
      }

      if (hasDragged) {
        scrollContainer.scrollLeft = scrollLeft - dx;
        scrollContainer.scrollTop = scrollTop - dy;
      }
    };

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        scrollContainer = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    return () => {
      window.removeEventListener('dragstart', onDragStart);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
};

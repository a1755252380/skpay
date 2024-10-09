export default {
  bind(el, binding) {
    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
    tooltip.innerText = binding.value || "双击复制文本";
    document.body.appendChild(tooltip);

    const showTooltip = () => {
      tooltip.style.opacity = "0.7";
      tooltip.style.visibility = "visible";
      const rect = el.getBoundingClientRect();
      tooltip.style.position = "absolute";
      tooltip.style.top = `${rect.bottom + window.scrollY}px`;
      tooltip.style.left = `${
        rect.left +
        window.scrollX +
        el.offsetWidth / 2 -
        tooltip.offsetWidth / 2
      }px`;
    };

    const hideTooltip = () => {
      tooltip.style.opacity = "0";
      tooltip.style.visibility = "hidden";
    };

    el.addEventListener("mouseenter", showTooltip);
    el.addEventListener("mouseleave", hideTooltip);

    // 清理工作
    el._tooltip = tooltip;
  },
  unbind(el) {
    document.body.removeChild(el._tooltip);
  },
};

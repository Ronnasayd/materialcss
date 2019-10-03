window.onload = () => {
  const handleRipples = () => {
    const ripples = document.querySelectorAll(".ripple");
    ripples.forEach(value => {
      value.addEventListener("click", e => {
        const targetPositionX = e.target.offsetLeft;
        const targetPositionY = e.target.offsetTop;

        const rippleSpan = document.createElement("span");
        rippleSpan.setAttribute("class", "ripple-child");

        const size =
          e.target.offsetHeight < e.target.offsetWidth
            ? e.target.offsetWidth
            : e.target.offsetHeight;

        rippleSpan.style.width = `${size}px`;
        rippleSpan.style.height = `${size}px`;

        const positionX = e.pageX - targetPositionX - size / 2;
        const positionY = e.pageY - targetPositionY - size / 2;

        rippleSpan.style.top = `${positionY}px`;
        rippleSpan.style.left = `${positionX}px`;

        e.target.appendChild(rippleSpan);

        e.target.addEventListener("animationend", e => {
          if (e.target.parentNode) {
            e.target.parentNode.removeChild(e.target);
          }
        });
      });
    });
  };

  handleRipples();
};

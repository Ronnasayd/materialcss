window.onload = () => {
  const handleRipples = () => {
    const ripples = document.querySelectorAll(".ripple");
    ripples.forEach(value => {
      value.addEventListener("click", e => {
        const targetPositionX = value.offsetLeft;
        const targetPositionY = value.offsetTop;

        const rippleSpan = document.createElement("span");
        rippleSpan.setAttribute("class", "ripple-child");

        let size = value.offsetHeight;
        if (value.offsetHeight < value.offsetWidth) {
          size = value.offsetWidth;
        }

        rippleSpan.style.width = `${size}px`;
        rippleSpan.style.height = `${size}px`;

        const positionX = e.pageX - targetPositionX - size / 2;
        const positionY = e.pageY - targetPositionY - size / 2;

        rippleSpan.style.top = `${positionY}px`;
        rippleSpan.style.left = `${positionX}px`;

        value.appendChild(rippleSpan);

        value.addEventListener("animationend", e => {
          if (value.lastElementChild === rippleSpan) {
            value.removeChild(rippleSpan);
          }
        });
      });
    });
  };

  handleRipples();
};

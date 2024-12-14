console.clear();

gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".wrapper",
        start: "top top",
        end: "+=200%", // Increased from 150% to 200% for a longer scroll effect
        pin: true,
        scrub: true,
        markers: true
      }
    })
    .to("img", {
      scale: 3.5, // Increased from 2 to 3.5 for more zoom
      z: 600, // Increased from 350 to 600 for more depth
      transformOrigin: "center center",
      ease: "power2.inOut" // Changed to power2 for a slightly different easing
    })
    .to(
      ".section.hero",
      {
        scale: 1.2, // Increased from 1.1 to 1.2
        transformOrigin: "center center",
        ease: "power2.inOut"
      },
      "<"
    );
});

const tooltip_element = document.querySelector("#tooltip");
const root_element = document.querySelector(":root");
const eyes_elements = document.querySelectorAll("#eyes .eye");
const mouth_element = document.querySelector("#mouth");
const mouth_inner_element = document.querySelector("#mouth .inner");
const egg_container = document.querySelector("#egg-container");

document.body.addEventListener("mousemove", (mouseevent) => {
    const egg_rect = egg_container.getBoundingClientRect();
    const mouse_location = [
        Math.round(mouseevent.clientX - egg_rect.left),
        Math.round(mouseevent.clientY - egg_rect.top)
    ];
    const egg_size = [egg_rect.width, egg_rect.height];
    const position_in_percentage_from_center = [
        Math.round((mouse_location[0] / egg_size[0] * 100 - 50) * 2),
        Math.round((mouse_location[1] / egg_size[1] * 100 - 50) * 2)
    ];

    tooltip_element.style.left = (mouseevent.clientX + 10) + "px";
    tooltip_element.style.top = (mouseevent.clientY - 40) + "px";
    tooltip_element.innerText = `${position_in_percentage_from_center[0]},${position_in_percentage_from_center[1]}`;

    root_element.style.setProperty("--eyes-perspective-horizontal", `${position_in_percentage_from_center[0] / 5}deg`);
    root_element.style.setProperty("--eyes-perspective-vertical", `${position_in_percentage_from_center[1] * -1 / 5}deg`);

    root_element.style.setProperty("--location-face-horizonal", `${position_in_percentage_from_center[0] / 20}%`);
    root_element.style.setProperty("--location-iris-horizontal", `${position_in_percentage_from_center[0] / 10}%`);
    root_element.style.setProperty("--location-pupil-horizontal", `${position_in_percentage_from_center[0] / 10}%`);

    root_element.style.setProperty("--location-face-vertical", `${position_in_percentage_from_center[1] / 20}%`);
    root_element.style.setProperty("--location-iris-vertical", `${position_in_percentage_from_center[1] / 20}%`);
    root_element.style.setProperty("--location-pupil-vertical", `${position_in_percentage_from_center[1] / 10}%`);
});

navigator.mediaDevices.getUserMedia({audio: true}).then((audiostream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(audiostream);
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    let volume;

    microphone.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);

    scriptProcessor.addEventListener("audioprocess", () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        const arraySum = array.reduce((a, value) => a + value, 0);
        const average = arraySum / array.length;
        volume = Math.max(0, Math.round(average) + 10);

        console.log(volume);

        if (volume < 20) {
            mouth_element.classList.add("closed");
            mouth_element.classList.remove("sucking");
            mouth_inner_element.style.width = "";
        } else if (volume > 50) {
            mouth_element.classList.add("sucking");
            mouth_element.classList.remove("closed");
            mouth_inner_element.style.width = `70%`;
        } else {
            mouth_element.classList.remove("closed");
            mouth_element.classList.remove("sucking");
            mouth_inner_element.style.width = `${volume * 1.5}%`;
        }
    });
});

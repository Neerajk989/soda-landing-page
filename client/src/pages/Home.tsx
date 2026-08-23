/**
 * Kinetic Carbonation design: an asymmetric, full-viewport 3D beverage campaign.
 * The central can and active atmospheric layers remain the focus; text and glass UI frame it.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Plus } from "lucide-react";

declare const gsap: any;

const ASSETS = {
  leaves: "https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/leaves.glb",
  cherry: "https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/cherry.glb",
  blueberry: "https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/blueberry.glb",
  can: "https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/deit_soda2.glb",
  classicCard: "https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/Green%20Soda.png",
  blueCard: "https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/Blue%20Soda.png",
  greenTexture: "https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/green%20base%20color.jpg",
  blueTexture: "https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/blue%20base%20color.jpg",
  bubble: "https://api.getlayers.ai/storage/v1/object/public/public/assets/soda-14ff8a788d/bubble.png",
};

const ModelViewer = "model-viewer" as any;

type Flavor = "classic" | "blue";
type ModelViewerElement = HTMLElement & {
  cameraOrbit?: string;
  createTexture?: (url: string) => Promise<unknown>;
  model?: { materials: Array<{ pbrMetallicRoughness?: { baseColorTexture?: { setTexture: (texture: unknown) => void } } }> };
};

const berryClasses = ["b1", "b2", "b3", "b4", "b5", "b6"];
const backgroundBerryClasses = ["b7", "b8", "b9"];
const leafClasses = ["l1", "l2", "l3", "l4"];

export default function Home() {
  const [activeFlavor, setActiveFlavor] = useState<Flavor>("classic");
  const switchingRef = useRef(false);
  const spinRef = useRef(0);
  const textureRef = useRef<{ blue: unknown | null; green: unknown | null }>({ blue: null, green: null });

  const switchFlavor = useCallback((flavor: Flavor) => {
    if (switchingRef.current || flavor === activeFlavor) return;
    switchingRef.current = true;
    setActiveFlavor(flavor);

    const productModel = document.querySelector("#product-model") as ModelViewerElement | null;
    const stage = document.querySelector(".soda-world") as HTMLElement | null;
    const berries = Array.from(document.querySelectorAll<HTMLElement>(".berry"));
    const heroCenter = document.querySelector(".hero-center") as HTMLElement | null;
    if (!productModel || !stage || !heroCenter || typeof gsap === "undefined") {
      switchingRef.current = false;
      return;
    }

    const targetColors = flavor === "blue"
      ? { inner: "#0b4f8a", mid: "#04294e", outer: "#010c14" }
      : { inner: "#0b8a78", mid: "#044e3b", outer: "#011411" };

    gsap.to(stage, { "--bg-inner": targetColors.inner, "--bg-mid": targetColors.mid, "--bg-outer": targetColors.outer, duration: 1.5, ease: "power2.inOut" });

    const spinState = { val: 0, blur: 0 };
    gsap.to(spinState, {
      val: 360,
      blur: 15,
      duration: 0.6,
      ease: "power2.in",
      onUpdate: () => {
        spinRef.current = spinState.val;
        productModel.style.filter = `blur(${spinState.blur}px)`;
      },
      onComplete: () => {
        const texture = flavor === "blue" ? textureRef.current.blue : textureRef.current.green;
        if (productModel.model && texture) {
          productModel.model.materials.forEach((material) => material.pbrMetallicRoughness?.baseColorTexture?.setTexture(texture));
        }
        gsap.to(spinState, {
          val: 720,
          blur: 0,
          duration: 1.5,
          ease: "back.out(0.7)",
          onUpdate: () => {
            spinRef.current = spinState.val;
            productModel.style.filter = `blur(${spinState.blur}px)`;
          },
          onComplete: () => {
            spinRef.current = 0;
            productModel.style.filter = "none";
          },
        });
      },
    });

    let completed = 0;
    berries.forEach((berry) => {
      const rect = berry.getBoundingClientRect();
      const centerX = window.innerWidth / 2 - rect.left - rect.width / 2;
      const centerY = window.innerHeight / 2 - rect.top - rect.height / 2;
      const angle = Number(berry.dataset.angle ?? 0);
      const baseX = Number(berry.dataset.baseX ?? 0);
      const baseY = Number(berry.dataset.baseY ?? 0);
      const nextX = (Math.random() - 0.5) * 200;
      const nextY = (Math.random() - 0.5) * 200;
      gsap.set(berry, { rotation: angle, x: baseX, y: baseY });
      gsap.timeline()
        .to(berry, {
          x: centerX, y: centerY, rotation: angle + 45, scale: 0.1, opacity: 0, duration: 0.5, ease: "power2.in",
          onComplete: () => {
            berry.setAttribute("src", flavor === "blue" ? ASSETS.blueberry : ASSETS.cherry);
            heroCenter.style.zIndex = "50";
          },
        })
        .to(berry, { duration: 0.3 })
        .to(berry, {
          x: nextX, y: nextY, rotation: angle + 90, scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.5)",
          onStart: () => { heroCenter.style.zIndex = "1"; },
          onComplete: () => {
            berry.dataset.angle = String(angle + 90);
            berry.dataset.baseX = String(nextX);
            berry.dataset.baseY = String(nextY);
            berry.dataset.rx = "0";
            berry.dataset.ry = "0";
            completed += 1;
            if (completed === berries.length) switchingRef.current = false;
          },
        });
    });
  }, [activeFlavor]);

  useEffect(() => {
    const productModel = document.querySelector("#product-model") as ModelViewerElement | null;
    const bubblesContainer = document.querySelector("#bubbles-container") as HTMLElement | null;
    if (!productModel) return;

    const warmTextures = async () => {
      if (!productModel.createTexture) return;
      try {
        textureRef.current.blue = await productModel.createTexture(ASSETS.blueTexture);
        textureRef.current.green = await productModel.createTexture(ASSETS.greenTexture);
        const material = productModel.model?.materials[0];
        if (material?.pbrMetallicRoughness?.baseColorTexture && textureRef.current.blue && textureRef.current.green) {
          material.pbrMetallicRoughness.baseColorTexture.setTexture(textureRef.current.blue);
          await new Promise((resolve) => requestAnimationFrame(resolve));
          material.pbrMetallicRoughness.baseColorTexture.setTexture(textureRef.current.green);
        }
      } catch {
        // The base model remains visible if a remote texture is unavailable.
      }
    };
    productModel.addEventListener("load", warmTextures, { once: true });

    const allBerries = Array.from(document.querySelectorAll<HTMLElement>(".berry"));
    allBerries.forEach((berry) => {
      berry.dataset.rx = "0";
      berry.dataset.ry = "0";
      berry.dataset.angle = String(Math.random() * 360);
      berry.dataset.baseX = "0";
      berry.dataset.baseY = "0";
    });

    const mouse = { x: 0, y: 0, px: window.innerWidth / 2, py: window.innerHeight / 2 };
    const current = { x: 0, y: 0 };
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX / window.innerWidth - 0.5;
      mouse.y = event.clientY / window.innerHeight - 0.5;
      mouse.px = event.clientX;
      mouse.py = event.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    let frameId = 0;
    const animate = () => {
      const time = Date.now() * 0.001;
      current.x += (mouse.x - current.x) * 0.05;
      current.y += (mouse.y - current.y) * 0.05;
      productModel.cameraOrbit = `${current.x * 40 + spinRef.current}deg ${90 + current.y * 20}deg 380%`;

      const berriesFG = document.querySelector(".berries-container") as HTMLElement | null;
      const berriesBG = document.querySelector(".berries-container-bg") as HTMLElement | null;
      const leaves = document.querySelector(".leaves-container") as HTMLElement | null;
      if (berriesFG) berriesFG.style.transform = `translate(${current.x * 60}px, ${current.y * 60}px)`;
      if (berriesBG) berriesBG.style.transform = `translate(${current.x * -30}px, ${current.y * -30}px)`;
      if (leaves) leaves.style.transform = `translate(${current.x * -15}px, ${current.y * -15}px)`;

      if (!switchingRef.current) {
        allBerries.forEach((berry, index) => {
          const rect = berry.getBoundingClientRect();
          const bx = rect.left + rect.width / 2;
          const by = rect.top + rect.height / 2;
          const dx = mouse.px - bx;
          const dy = mouse.py - by;
          const distance = Math.sqrt(dx * dx + dy * dy);
          let targetRx = 0;
          let targetRy = 0;
          let speed = 1;
          if (distance < 400 && distance > 0.1) {
            const force = (400 - distance) / 400;
            targetRx = (dx / distance) * force * -80;
            targetRy = (dy / distance) * force * -80;
            speed = 1 + force * 5;
          }
          const rx = Number(berry.dataset.rx ?? 0) + (targetRx - Number(berry.dataset.rx ?? 0)) * 0.1;
          const ry = Number(berry.dataset.ry ?? 0) + (targetRy - Number(berry.dataset.ry ?? 0)) * 0.1;
          const angle = Number(berry.dataset.angle ?? 0) + 0.2 * speed;
          const baseX = Number(berry.dataset.baseX ?? 0);
          const baseY = Number(berry.dataset.baseY ?? 0);
          berry.dataset.rx = String(rx);
          berry.dataset.ry = String(ry);
          berry.dataset.angle = String(angle);
          const duration = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10][index % 9];
          const phase = (time + index * 0.7) * (Math.PI * 2 / duration);
          berry.style.transform = `translate(${rx + baseX}px, ${ry + baseY + Math.sin(phase) * 15}px) rotate(${angle + Math.cos(phase) * 6}deg)`;
        });
      }

      document.querySelectorAll<HTMLElement>(".leaf").forEach((leaf, index) => {
        const phase = (time + index * 1.2) * (Math.PI * 2 / (10 + index * 2));
        leaf.style.transform = `translate(${Math.cos(phase * 0.5) * 15}px, ${Math.sin(phase) * 20}px) rotate(${Math.sin(phase * 0.3) * 15}deg)`;
      });
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const createBubble = () => {
      if (!bubblesContainer) return;
      const bubble = document.createElement("img");
      bubble.src = ASSETS.bubble;
      bubble.className = "bubble-img";
      bubble.style.width = `${Math.random() * 20 + 10}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.bottom = "-50px";
      const duration = Math.random() * 6 + 4;
      bubble.style.animation = `floatUpImg ${duration}s linear forwards`;
      bubblesContainer.appendChild(bubble);
      window.setTimeout(() => bubble.remove(), duration * 1000);
    };
    const bubbleInterval = window.setInterval(createBubble, 400);

    return () => {
      productModel.removeEventListener("load", warmTextures);
      window.removeEventListener("mousemove", onMouseMove);
      window.cancelAnimationFrame(frameId);
      window.clearInterval(bubbleInterval);
    };
  }, []);

  const flipFlavor = () => switchFlavor(activeFlavor === "classic" ? "blue" : "classic");

  return (
    <div className={`soda-world ${activeFlavor === "blue" ? "is-blue" : "is-classic"}`}>
      <div className="atmosphere atmosphere-classic" aria-hidden="true" />
      <div className="atmosphere atmosphere-blue" aria-hidden="true" />
      <div id="bubbles-container" aria-hidden="true" />

      <header className="header">
        <a className="logo" href="#home" aria-label="Soda home">
          <img className="logo-mark" src="/manus-storage/soda-orb-mark_6ff73453.png" alt="" />
          <span>Soda</span>
        </a>
        <nav className="nav glass" aria-label="Main navigation">
          {["Home", "Ingredients", "Taste", "Eco", "Reviews"].map((item, index) => (
            <a href="#home" className={`nav-item ${index === 0 ? "active" : ""}`} key={item}>{item}</a>
          ))}
        </nav>
        <a className="contact-btn" href="mailto:hello@soda.example">Contact Us</a>
      </header>

      <main className="hero" id="home">
        <div className="hero-content">
          <div className="leaves-container" aria-hidden="true">
            {leafClasses.map((className, index) => <ModelViewer key={className} className={`leaf ${className}`} src={ASSETS.leaves} environment-image="neutral" exposure="1.0" interaction-prompt="none" camera-orbit={`${index * 55 - 30}deg ${45 + index * 10}deg 105%`} />)}
          </div>

          <section className="hero-left">
            <h1 className="main-title"><span>Pure</span><br />Zero</h1>
            <p className="description">Unleash the crisp taste of zero sugar.<br />Refreshment redefined in every bubble —<br />all in one sleek design.</p>
            <button className="primary-btn" type="button" onClick={flipFlavor}>Shop Now <span className="plus-icon"><Plus size={18} strokeWidth={3} /></span></button>
            <div className="award-badge">
              <div className="award-icon"><ChevronDown size={25} strokeWidth={2} /></div>
              <div className="award-text"><span className="award-title">DESIGN AWARDS</span><span className="award-subtitle">PREMIUM BEVERAGE 2025</span></div>
            </div>
          </section>

          <div className="berries-container-bg" aria-hidden="true">
            {backgroundBerryClasses.map((className, index) => <ModelViewer key={className} className={`berry ${className}`} src={ASSETS.cherry} environment-image="neutral" exposure="1.0" interaction-prompt="none" camera-orbit={`${index * 75 - 20}deg ${45 + index * 15}deg 105%`} />)}
          </div>

          <div className="hero-center" aria-label="Diet Soda 3D product view">
            <div className="product-halo" />
            <ModelViewer id="product-model" src={ASSETS.can} alt="Diet Soda 3D Model" camera-controls disable-zoom shadow-intensity="0" environment-image="neutral" exposure="1.5" interaction-prompt="none" camera-orbit="0deg 90deg 380%" field-of-view="30deg" className="main-product-3d" />
          </div>

          <div className="berries-container" aria-hidden="true">
            {berryClasses.map((className, index) => <ModelViewer key={className} className={`berry ${className}`} src={ASSETS.cherry} environment-image="neutral" exposure="1.2" interaction-prompt="none" camera-orbit={`${[45, -120, 200, 10, -45, 80][index]}deg ${[120, 45, 90, 20, 160, 75][index]}deg 105%`} />)}
          </div>

          <section className="hero-right" id="flavors">
            <div className="product-carousel">
              <div className="carousel-cards">
                <button type="button" className={`card ${activeFlavor === "classic" ? "active" : ""}`} onClick={() => switchFlavor("classic")} aria-pressed={activeFlavor === "classic"}>
                  <img src={ASSETS.classicCard} alt="Diet Classic" />
                  <span className="card-info"><span>Diet Classic</span><span>$2.99</span></span>
                </button>
                <button type="button" className={`card card-blue ${activeFlavor === "blue" ? "active" : ""}`} onClick={() => switchFlavor("blue")} aria-pressed={activeFlavor === "blue"}>
                  <img src={ASSETS.blueCard} alt="Zero Lime" />
                  <span className="card-info"><span>Zero Lime</span><span>$2.99</span></span>
                </button>
              </div>
              <div className="carousel-nav" aria-label="Flavor carousel controls">
                <button className="nav-arrow" type="button" onClick={flipFlavor} aria-label="Previous flavor"><ArrowLeft size={16} /></button>
                <button className="nav-arrow" type="button" onClick={flipFlavor} aria-label="Next flavor"><ArrowRight size={16} /></button>
              </div>
            </div>
            <h2 className="side-title"><span>Refreshingly</span><br />Clean</h2>
          </section>
        </div>
      </main>

      <svg className="frosted-filter" aria-hidden="true"><filter id="frosted"><feTurbulence type="fractalNoise" baseFrequency="0.0125" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="80" xChannelSelector="R" yChannelSelector="G" /></filter></svg>
      <div className="model-preload" aria-hidden="true"><ModelViewer src={ASSETS.blueberry} /><ModelViewer src={ASSETS.cherry} /></div>
    </div>
  );
}

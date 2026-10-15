import Link from "next/link";
import { profile } from "@/content/profile";

export default function NotFound() {
  return (
    <div className="container notfound">
      <div className="window" style={{ width: "100%" }}>
        <div className="window-bar">
          <span aria-hidden="true" className="dot dot-red" />
          <span aria-hidden="true" className="dot dot-amber" />
          <span aria-hidden="true" className="dot dot-green" />
          <span className="window-title">{profile.handle}@portfolio: ~</span>
        </div>
        <div className="window-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span className="prompt">
            <span className="prompt-sign">$</span> cd this-page
          </span>
          <h1 className="hero-name" style={{ fontSize: "clamp(28px, 5vw, 44px)" }}>
            404: no such file or directory
          </h1>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/">
              cd ~
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

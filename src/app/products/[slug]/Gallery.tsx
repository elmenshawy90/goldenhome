"use client";

import { useState } from "react";

export default function Gallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [{ url: "/placeholder.svg", alt: name }];
  return (
    <div>
      <div className="card overflow-hidden">
        <div className="aspect-[4/3] bg-sand-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={list[active]?.url} alt={list[active]?.alt} className="h-full w-full object-cover" />
        </div>
      </div>
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {list.map((im, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-xl border-2 transition ${
                i === active ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt={im.alt} className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

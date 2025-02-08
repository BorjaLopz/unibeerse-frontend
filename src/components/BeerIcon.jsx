function BeerIcon({ style }) {
  switch (style.toLowerCase()) {
    case "lager":
      return <img src="/BeerIcons/lager.svg" alt="" className="beer_image" />;
    case "pilsen":
      return <img src="/BeerIcons/pilsen.svg" alt="" className="beer_image" />;
    case "stout":
      return <img src="/BeerIcons/stout.svg" alt="" className="beer_image" />;
    case "abadia":
      return <img src="/BeerIcons/abadia.svg" alt="" className="beer_image" />;
    case "ale":
      return <img src="/BeerIcons/ale.svg" alt="" className="beer_image" />;
    case "ipa":
      return <img src="/BeerIcons/ipa.svg" alt="" className="beer_image" />;
    case "trapenses":
      return (
        <img src="/BeerIcons/trapenses.svg" alt="" className="beer_image" />
      );

    default:
      return <img src="/BeerIcons/default.svg" alt="" className="beer_image" />;

    // return (
    //   <svg
    //     aria-describedby="desc"
    //     aria-labelledby="title"
    //     role="img"
    //     viewBox="0 0 64 64"
    //     xmlns="http://www.w3.org/2000/svg"
    //     xmlnsXlink="http://www.w3.org/1999/xlink"
    //     id="beer_image"
    //   >
    //     <title>Beer Bottle</title>
    //     <desc>A color styled icon from Orion Icon Library.</desc>
    //     <path
    //       d="M39.4 28.3c-1.2-1.1-1.7-3.1-1.8-6.8 0-.9-.1-2.2-.2-3.6H26.6c-.1 1.4-.2 2.7-.2 3.6-.1 3.7-.5 5.7-1.8 6.8A8.2 8.2 0 0 0 22 34v24c0 2 1.8 4 5.6 4h8.8c3.8 0 5.6-2 5.6-4V34a8.2 8.2 0 0 0-2.6-5.7z"
    //       data-name="layer4"
    //       fill="#68963f"
    //     />
    //     <path
    //       d="M38 6V4a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v2z"
    //       data-name="layer3"
    //       fill="#f9d28c"
    //     />
    //     <path
    //       d="M28 6c-.3 1.7-1 7.6-1.4 12h10.8C37 13.6 36.3 7.7 36 6"
    //       data-name="layer2"
    //       fill="#8caf61"
    //     />
    //     <path
    //       d="M27 58V34a12.8 12.8 0 0 1 1.3-5.7c.6-1.1.8-3.1.9-6.8 0-.9.1-2.2.1-3.6h-2.7c-.1 1.4-.2 2.7-.2 3.6-.1 3.7-.5 5.7-1.8 6.8A8.2 8.2 0 0 0 22 34v24c0 2 1.8 4 5.6 4h2.2c-1.9 0-2.8-2-2.8-4z"
    //       data-name="opacity"
    //       fill="#101129"
    //       opacity=".25"
    //     />
    //     <path
    //       d="M39.4 28.3c-1.2-1.1-1.7-3.1-1.8-6.8 0-.9-.1-2.2-.2-3.6h-2.7c.1 1.4.1 2.7.1 3.6 0 3.7.3 5.7.9 6.8A12.8 12.8 0 0 1 37 34v24c0 2-.9 4-2.8 4h2.2c3.8 0 5.6-2 5.6-4V34a8.2 8.2 0 0 0-2.6-5.7z"
    //       data-name="opacity"
    //       fill="#fff"
    //       opacity=".5"
    //     />
    //     <path
    //       d="M29 4c0-1.1.4-2 1-2h-2a2 2 0 0 0-2 2v2h3z"
    //       data-name="opacity"
    //       fill="#101129"
    //       opacity=".25"
    //     />
    //     <path
    //       d="M35 4v2h3V4a2 2 0 0 0-2-2h-2c.6 0 1 .9 1 2zm-1 2c.1 1.7.5 7.6.7 12h2.7C37 13.6 36.3 7.7 36 6h-2z"
    //       data-name="opacity"
    //       fill="#fff"
    //       opacity=".5"
    //     />
    //     <path
    //       d="M30 6h-2c-.3 1.7-1 7.6-1.4 12h2.7c.2-4.4.6-10.3.7-12z"
    //       data-name="opacity"
    //       fill="#101129"
    //       opacity=".25"
    //     />
    //     <ellipse
    //       cx="32"
    //       cy="40"
    //       data-name="layer1"
    //       fill="#d5e2f4"
    //       rx="6"
    //       ry="8"
    //     />
    //     <ellipse
    //       cx="32"
    //       cy="40"
    //       data-name="stroke"
    //       fill="none"
    //       rx="6"
    //       ry="8"
    //       stroke="#2f446a"
    //       strokeLinecap="round"
    //       strokeLinejoin="round"
    //       strokeWidth={2}
    //     />
    //     <path
    //       d="M38 6V4a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v2zM28 6c-.3 1.7-1 7.6-1.4 12h10.8C37 13.6 36.3 7.7 36 6"
    //       data-name="stroke"
    //       fill="none"
    //       stroke="#2f446a"
    //       strokeLinecap="round"
    //       strokeLinejoin="round"
    //       strokeWidth={2}
    //     />
    //     <path
    //       d="M39.4 28.3c-1.2-1.1-1.7-3.1-1.8-6.8 0-.9-.1-2.2-.2-3.6H26.6c-.1 1.4-.2 2.7-.2 3.6-.1 3.7-.5 5.7-1.8 6.8A8.2 8.2 0 0 0 22 34v24c0 2 1.8 4 5.6 4h8.8c3.8 0 5.6-2 5.6-4V34a8.2 8.2 0 0 0-2.6-5.7z"
    //       data-name="stroke"
    //       fill="none"
    //       stroke="#2f446a"
    //       strokeLinecap="round"
    //       strokeLinejoin="round"
    //       strokeWidth={2}
    //     />
    //   </svg>
    // );
  }
}

export default BeerIcon;

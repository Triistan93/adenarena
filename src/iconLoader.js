let iconIndex = {};

export async function loadIconIndex() {
    if (Object.keys(iconIndex).length)
        return;

    const response = await fetch("./img/icons/icon_index.json");

    if (!response.ok) {
        console.error("Não foi possível carregar icon_index.json");
        return;
    }

    iconIndex = await response.json();
}

export function getIcon(iconName) {

    if (!iconName)
        return "./img/icons/default.png";

    const path = iconIndex[iconName];

    if (path)
        return `./img/icons/${path}`;

    return `./img/icons/${iconName}.png`;
}

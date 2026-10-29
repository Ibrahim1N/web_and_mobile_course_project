const model = buildVenueModel();

const mapViewport = document.getElementById("map-viewport");
const mapWorld = document.getElementById("map-world");
const zoneLegend = document.getElementById("zone-legend");
const seatDetails = document.getElementById("seat-details");

const seatSize = 22;
let inspectedSeatId = null;

function placeBox(element, x, y, width, height) {
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
}

function renderZoneLegend() {
  venue.zones.forEach(zone => {
    const item = document.createElement("li");
    const swatch = document.createElement("span");
    swatch.classList.add("swatch", "zone-swatch");
    swatch.style.backgroundColor = zone.color;
    item.append(swatch, `${zone.name} · ${formatPrice(zone.price)}`);
    zoneLegend.append(item);
  });
}

function renderFixtures() {
  venue.fixtures.forEach(fixture => {
    const element = document.createElement("div");
    element.classList.add("fixture", fixture.kind);
    element.textContent = fixture.label;
    placeBox(element, fixture.x, fixture.y, fixture.width, fixture.height);
    mapWorld.append(element);
  });
}

function renderZones() {
  venue.zones.forEach(zone => {
    const area = document.createElement("div");
    area.classList.add("zone-area");
    area.style.borderColor = zone.color;
    placeBox(area, zone.area.x, zone.area.y, zone.area.width, zone.area.height);

    const label = document.createElement("span");
    label.classList.add("zone-label");
    label.style.backgroundColor = zone.color;
    label.textContent = `${zone.name} · ${formatPrice(zone.price)}`;

    area.append(label);
    mapWorld.append(area);
  });
}

function renderTables() {
  model.tables.forEach(table => {
    const zone = findZone(table.zoneId);
    if (zone.table.shape === "stool") return;

    const element = document.createElement("div");
    element.classList.add("table", zone.table.shape);
    element.textContent = table.id;

    const half = zone.table.size / 2;
    placeBox(element, table.x - half, table.y - half, zone.table.size, zone.table.size);
    mapWorld.append(element);
  });
}

function renderSeats() {
  model.seats.forEach(seat => {
    const zone = findZone(seat.zoneId);
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("seat");
    if (zone.table.shape === "stool") {
      button.classList.add("stool");
    }

    button.setAttribute("data-seat-id", seat.id);
    button.setAttribute("aria-label", `${zone.name}, ${zone.unit} ${seat.tableId}, Seat ${seat.number}, ${formatPrice(seat.price)}`);
    button.title = `${seat.tableId} · Seat ${seat.number} · ${formatPrice(seat.price)}`;
    button.style.left = `${seat.x - seatSize / 2}px`;
    button.style.top = `${seat.y - seatSize / 2}px`;

    if (seat.status === "unavailable") {
      button.classList.add("unavailable");
      button.setAttribute("aria-disabled", "true");
      button.title = `${button.title} · Sold`;
    } else {
      button.style.borderColor = zone.color;
    }

    mapWorld.append(button);
  });
}

function findSeat(seatId) {
  return model.seats.find(seat => seat.id === seatId);
}

function findSeatButton(seatId) {
  return mapWorld.querySelector(`[data-seat-id="${seatId}"]`);
}

function createParagraph(text, className) {
  const paragraph = document.createElement("p");
  paragraph.classList.add(className);
  paragraph.textContent = text;
  return paragraph;
}

function renderSeatDetails(seat) {
  const zone = findZone(seat.zoneId);

  const title = document.createElement("h3");
  title.classList.add("detail-zone");
  title.style.color = zone.color;
  title.textContent = zone.name;

  const place = createParagraph(`${zone.unit} ${seat.tableId} · Seat ${seat.number}`, "detail-place");
  const description = createParagraph(zone.description, "detail-description");
  const price = createParagraph(formatPrice(seat.price), "detail-price");

  let status;
  if (seat.status === "unavailable") {
    status = createParagraph("Sold – this seat cannot be booked.", "detail-status");
    status.classList.add("sold");
  } else {
    status = createParagraph("Available", "detail-status");
  }

  seatDetails.replaceChildren(title, place, description, price, status);
}

function inspectSeat(seatId) {
  if (inspectedSeatId !== null) {
    findSeatButton(inspectedSeatId).classList.remove("inspected");
  }

  inspectedSeatId = seatId;
  findSeatButton(seatId).classList.add("inspected");
  renderSeatDetails(findSeat(seatId));
}

function clearInspection() {
  if (inspectedSeatId === null) return;

  findSeatButton(inspectedSeatId).classList.remove("inspected");
  inspectedSeatId = null;

  const message = createParagraph("Select a seat on the map to see its details and price.", "placeholder");
  seatDetails.replaceChildren(message);
}

function handleMapClick(event) {
  const button = event.target.closest(".seat");
  if (!button || !mapWorld.contains(button)) return;

  const seatId = button.getAttribute("data-seat-id");
  if (seatId === inspectedSeatId) {
    clearInspection();
  } else {
    inspectSeat(seatId);
  }
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    clearInspection();
  }
}

function fitToViewport() {
  const padding = 16;
  const availableWidth = mapViewport.clientWidth - padding * 2;
  const availableHeight = mapViewport.clientHeight - padding * 2;
  const scale = Math.min(availableWidth / venue.width, availableHeight / venue.height);
  const offsetX = (mapViewport.clientWidth - venue.width * scale) / 2;
  const offsetY = (mapViewport.clientHeight - venue.height * scale) / 2;
  mapWorld.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

function init() {
  document.getElementById("event-name").textContent = venue.event;
  mapWorld.style.width = `${venue.width}px`;
  mapWorld.style.height = `${venue.height}px`;

  renderZoneLegend();
  renderFixtures();
  renderZones();
  renderTables();
  renderSeats();
  fitToViewport();

  window.addEventListener("resize", fitToViewport);
  mapWorld.addEventListener("click", handleMapClick);
  document.addEventListener("keydown", handleKeydown);

  const soldCount = model.seats.filter(seat => seat.status === "unavailable").length;
  console.log(`${venue.name}: ${model.tables.length} tables, ${model.seats.length} seats, ${soldCount} sold`);
}

init();

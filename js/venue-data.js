const venue = {
  name: "Courtyard Canteen",
  event: "Friday Night Jazz Supper",
  width: 1200,
  height: 1160,

  fixtures: [
    { label: "Kitchen", kind: "block", x: 30, y: 24, width: 200, height: 86 },
    { label: "Stage", kind: "block", x: 380, y: 24, width: 440, height: 86 },
    { label: "WC", kind: "block", x: 880, y: 24, width: 110, height: 86 },
    { label: "Buffet", kind: "counter", x: 40, y: 170, width: 210, height: 56 },
    { label: "Drinks", kind: "counter", x: 40, y: 260, width: 210, height: 56 },
    { label: "Bar", kind: "block", x: 1110, y: 170, width: 60, height: 560 },
    { label: "Entrance", kind: "door", x: 150, y: 1104, width: 180, height: 34 },
    { label: "Garden doors", kind: "door", x: 700, y: 1104, width: 220, height: 34 },
    { label: "Exit", kind: "door", x: 1090, y: 1040, width: 80, height: 40 }
  ],

  zones: [
    {
      id: "vip",
      code: "V",
      name: "VIP Lounge",
      price: 45,
      color: "#c2410c",
      description: "Front tables beside the stage. Welcome drink included.",
      unit: "Table",
      area: { x: 300, y: 140, width: 600, height: 240 },
      grid: { rows: 2, cols: 4, startX: 375, startY: 200, gapX: 150, gapY: 120 },
      table: {
        shape: "round",
        size: 60,
        chairs: [
          { x: 0, y: -44 },
          { x: 44, y: 0 },
          { x: 0, y: 44 },
          { x: -44, y: 0 }
        ]
      }
    },
    {
      id: "main",
      code: "M",
      name: "Main Floor",
      price: 30,
      color: "#1d4ed8",
      description: "Shared tables in the centre of the room with a clear view of the stage.",
      unit: "Table",
      area: { x: 130, y: 410, width: 900, height: 400 },
      grid: { rows: 3, cols: 6, startX: 215, startY: 480, gapX: 150, gapY: 130 },
      table: {
        shape: "round",
        size: 72,
        chairs: [
          { x: 0, y: -50 },
          { x: 43, y: -25 },
          { x: 43, y: 25 },
          { x: 0, y: 50 },
          { x: -43, y: 25 },
          { x: -43, y: -25 }
        ]
      }
    },
    {
      id: "terrace",
      code: "T",
      name: "Garden Terrace",
      price: 20,
      color: "#15803d",
      description: "Relaxed square tables at the back, next to the garden doors.",
      unit: "Table",
      area: { x: 130, y: 840, width: 900, height: 250 },
      grid: { rows: 2, cols: 7, startX: 210, startY: 910, gapX: 130, gapY: 115 },
      table: {
        shape: "square",
        size: 54,
        chairs: [
          { x: 0, y: -41 },
          { x: 41, y: 0 },
          { x: 0, y: 41 },
          { x: -41, y: 0 }
        ]
      }
    },
    {
      id: "bar",
      code: "B",
      name: "Bar Counter",
      price: 12,
      color: "#7e22ce",
      description: "High stools along the bar.",
      unit: "Stool",
      area: { x: 1050, y: 150, width: 130, height: 600 },
      grid: { rows: 14, cols: 1, startX: 1080, startY: 200, gapX: 0, gapY: 38 },
      table: {
        shape: "stool",
        size: 0,
        chairs: [{ x: 0, y: 0 }]
      }
    }
  ],

  soldSeats: [
    "V1-1", "V1-2", "V6-3",
    "M2-1", "M2-2", "M2-3", "M2-4", "M2-5", "M2-6",
    "M9-4", "M11-2", "M11-3", "M15-5",
    "T3-1", "T3-2", "T8-4", "T12-1",
    "B3-1", "B4-1", "B10-1"
  ]
};

function createTables(zone) {
  const tables = [];
  let number = 1;

  for (let row = 0; row < zone.grid.rows; row++) {
    for (let col = 0; col < zone.grid.cols; col++) {
      tables.push({
        id: `${zone.code}${number}`,
        number: number,
        zoneId: zone.id,
        x: zone.grid.startX + col * zone.grid.gapX,
        y: zone.grid.startY + row * zone.grid.gapY
      });
      number++;
    }
  }

  return tables;
}

function createSeats(zone, table) {
  return zone.table.chairs.map((chair, index) => {
    const id = `${table.id}-${index + 1}`;
    let status = "available";
    if (venue.soldSeats.includes(id)) {
      status = "unavailable";
    }

    return {
      id: id,
      number: index + 1,
      tableId: table.id,
      zoneId: zone.id,
      price: zone.price,
      x: table.x + chair.x,
      y: table.y + chair.y,
      status: status
    };
  });
}

function buildVenueModel() {
  const tables = [];
  const seats = [];

  venue.zones.forEach(zone => {
    createTables(zone).forEach(table => {
      tables.push(table);
      seats.push(...createSeats(zone, table));
    });
  });

  return { tables, seats };
}

function findZone(zoneId) {
  return venue.zones.find(zone => zone.id === zoneId);
}

function formatPrice(amount) {
  return `${amount} AZN`;
}

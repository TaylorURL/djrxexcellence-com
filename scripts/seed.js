/**
 * Seeds the project with sample inventory and proves the row-level policies
 * behave, by doing every write through the same client the browser uses rather
 * than through the service role.
 *
 * Sample listings carry a SAMPLE- MLS number so they are unmistakable in the
 * dashboard. `npm run seed -- --teardown` removes them and their photos.
 */
import { createClient } from "@supabase/supabase-js";
import { listingPhotos } from "./seed-images.js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const agentEmail = process.env.SEED_AGENT_EMAIL;
const agentPassword = process.env.SEED_AGENT_PASSWORD;
const memberEmail = process.env.SEED_MEMBER_EMAIL;
const memberPassword = process.env.SEED_MEMBER_PASSWORD;

if (!url || !key)
  throw new Error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");

const MLS_PREFIX = "SAMPLE-";
const BUCKET = "listing-photos";

const listings = [
  {
    slug: "1804-magnolia-bend-dayton",
    street_address: "1804 Magnolia Bend",
    city: "Dayton",
    zip: "77535",
    price: 389000,
    status: "active",
    property_type: "single_family",
    beds: 4,
    baths: 2.5,
    half_baths: 1,
    square_feet: 2340,
    lot_size_acres: 0.62,
    year_built: 2019,
    garage_spaces: 2,
    taxes_annual: 8180,
    school_district: "Dayton ISD",
    latitude: 30.0521,
    longitude: -94.8934,
    is_featured: true,
    features: [
      "Open kitchen with a walk-in pantry",
      "Primary suite on the first floor",
      "Covered back patio",
      "Two car attached garage",
      "Sprinkler system front and back",
      "Sits outside the 100 year floodplain",
    ],
    description:
      "Four bedrooms on a little over half an acre on the west side of Dayton, built in 2019 and still under the original owner. The primary suite is downstairs and separated from the other three bedrooms. The kitchen opens to the living room with a pantry big enough to be useful.\n\nThe lot backs to trees rather than another house. Covered patio across most of the rear elevation, and the yard is fenced on three sides. Dayton ISD, and the elementary campus is a short drive rather than a bus ride across the county.",
  },
  {
    slug: "512-cedar-street-dayton",
    street_address: "512 Cedar Street",
    city: "Dayton",
    zip: "77535",
    price: 265000,
    status: "active",
    property_type: "single_family",
    beds: 3,
    baths: 2,
    square_feet: 1680,
    lot_size_acres: 0.28,
    year_built: 2004,
    garage_spaces: 2,
    taxes_annual: 5590,
    school_district: "Dayton ISD",
    latitude: 30.0438,
    longitude: -94.8801,
    features: [
      "Roof replaced in 2022",
      "New HVAC condenser in 2023",
      "Fenced back yard",
      "Storage building stays",
      "No HOA",
    ],
    description:
      "A 2004 three bedroom in town, close enough to walk to the school and the grocery store. Roof came off in 2022 and the condenser was replaced the year after, so the two expensive items are behind you.\n\nThe back yard is fully fenced with a storage building that stays. No HOA and no MUD, which keeps the tax bill to the county and the school district only.",
  },
  {
    slug: "3115-trinity-river-road-liberty",
    street_address: "3115 Trinity River Road",
    city: "Liberty",
    zip: "77575",
    price: 289500,
    status: "active",
    property_type: "single_family",
    beds: 3,
    baths: 2,
    square_feet: 1910,
    lot_size_acres: 0.5,
    year_built: 1998,
    garage_spaces: 2,
    taxes_annual: 6120,
    school_district: "Liberty ISD",
    latitude: 30.0619,
    longitude: -94.8032,
    features: [
      "Half acre corner lot",
      "Wood burning fireplace",
      "Detached workshop with power",
      "Mature oaks across the front",
    ],
    description:
      "Half an acre on a corner lot with oaks that were here long before the house. Three bedrooms, two baths, and a living room with a wood burning fireplace that gets used.\n\nThe detached workshop behind the house has power run to it and a concrete floor. Liberty ISD, five minutes to the courthouse square and the hospital. Get the flood zone determination early on this one; the river bottom is closer than the address suggests.",
  },
  {
    slug: "227-barbers-hill-crossing-mont-belvieu",
    street_address: "227 Barbers Hill Crossing",
    city: "Mont Belvieu",
    zip: "77523",
    price: 529000,
    status: "active",
    property_type: "single_family",
    beds: 4,
    baths: 3,
    square_feet: 2880,
    lot_size_acres: 0.31,
    year_built: 2021,
    garage_spaces: 3,
    hoa_fee: 850,
    taxes_annual: 12440,
    school_district: "Barbers Hill ISD",
    latitude: 29.8542,
    longitude: -94.8821,
    is_featured: true,
    features: [
      "Barbers Hill ISD",
      "Three car garage",
      "Study with a closet, usable as a fifth bedroom",
      "Quartz counters throughout",
      "Neighborhood pool and playground",
      "Tankless water heater",
    ],
    description:
      "Built in 2021 in a neighborhood with sidewalks, a pool and a playground, inside the Barbers Hill ISD boundary. Four bedrooms plus a study that has a closet, so it counts as a fifth if you need it.\n\nThree car garage, quartz counters, tankless water heater. HOA dues are 850 a year and cover the pool, the playground and the common area maintenance. There is a MUD tax on this section on top of the school and county rates, and the total is worth understanding before the offer goes in.",
  },
  {
    slug: "14602-county-road-492-crosby",
    street_address: "14602 County Road 492",
    city: "Crosby",
    zip: "77532",
    price: 615000,
    status: "active",
    property_type: "farm_ranch",
    beds: 3,
    baths: 2,
    square_feet: 2060,
    lot_size_acres: 12.4,
    year_built: 2009,
    garage_spaces: 2,
    taxes_annual: 7860,
    school_district: "Crosby ISD",
    latitude: 29.9204,
    longitude: -95.0489,
    features: [
      "12.4 acres, cross fenced",
      "Barn with four stalls and a tack room",
      "Ag exemption in place",
      "Well and septic",
      "Pond stocked with bass",
    ],
    description:
      "Twelve and a half acres cross fenced, with a 2009 three bedroom set back from the road. The barn has four stalls, a tack room and a wash rack, and there is a pond toward the back of the property.\n\nAg exemption is in place and transfers if the use continues; ask what the tax bill looks like if it does not. Well and septic rather than city services, and the septic was last inspected in 2024.",
  },
  {
    slug: "tract-7-fostoria-road-cleveland",
    street_address: "Tract 7 Fostoria Road",
    city: "Cleveland",
    zip: "77327",
    price: 89900,
    status: "active",
    property_type: "land",
    lot_size_acres: 5.11,
    taxes_annual: 640,
    school_district: "Cleveland ISD",
    latitude: 30.3488,
    longitude: -95.0731,
    features: [
      "5.11 acres, lightly wooded",
      "County maintained road frontage",
      "Electric at the road",
      "No mobile home restriction",
    ],
    description:
      "Five acres of lightly wooded ground with frontage on a county maintained road, about ten minutes off I-69. Electric runs to the road; water and septic are on you.\n\nNo restriction against a mobile home on this tract, which is not true of every tract out here, so read the deed rather than assuming. Cleveland ISD.",
  },
  {
    slug: "3114-lakeview-terrace-huffman",
    street_address: "3114 Lakeview Terrace",
    city: "Huffman",
    zip: "77336",
    price: 349000,
    status: "coming_soon",
    property_type: "single_family",
    beds: 3,
    baths: 2,
    square_feet: 1750,
    lot_size_acres: 0.34,
    year_built: 2012,
    garage_spaces: 2,
    taxes_annual: 7210,
    school_district: "Huffman ISD",
    latitude: 30.0221,
    longitude: -95.1042,
    features: [
      "Deeded water access",
      "Boat and trailer parking",
      "Screened porch",
      "Generator transfer switch installed",
    ],
    description:
      "Three bedroom on a third of an acre with deeded access to the water, a few minutes from the Lake Houston boat ramp. Room beside the garage for a boat and trailer without blocking the drive.\n\nScreened porch across the back, and a generator transfer switch is already wired in at the panel. Huffman ISD. Photos and a showing schedule go up when it comes active.",
  },
  {
    slug: "908-baywood-crossing-baytown",
    street_address: "908 Baywood Crossing",
    city: "Baytown",
    zip: "77521",
    price: 232000,
    status: "pending",
    property_type: "townhouse",
    beds: 3,
    baths: 2.5,
    half_baths: 1,
    square_feet: 1540,
    year_built: 2016,
    garage_spaces: 1,
    hoa_fee: 1440,
    taxes_annual: 5480,
    school_district: "Goose Creek CISD",
    latitude: 29.7688,
    longitude: -94.9721,
    features: [
      "End unit",
      "HOA covers the roof and the exterior",
      "Private courtyard",
      "Minutes to I-10",
    ],
    description:
      "End unit townhouse built in 2016, three bedrooms up and living space down, with a private courtyard off the dining area. The HOA covers the roof, the exterior and the front landscaping, which is most of what people dislike about maintenance.\n\nOne car garage plus a driveway space. Minutes to I-10 and about twenty to the plants along the channel. Goose Creek CISD.",
  },
];

const testimonials = [
  {
    author_name: "Seed Example",
    author_location: "Dayton, TX",
    transaction_kind: "Sample entry",
    quote:
      "Replace this with a note a client actually wrote. Published testimonials show on the home page in position order, and the section is skipped entirely when none are published.",
    rating: 5,
    is_published: false,
    position: 99,
  },
];

function client() {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signInOrUp(email, password, fullName) {
  const supabase = client();
  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (!signIn.error)
    return { supabase, user: signIn.data.user, created: false };

  const signUp = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (signUp.error) throw signUp.error;
  if (!signUp.data.session) {
    throw new Error(
      `${email} signed up but no session came back; email confirmation may be on.`,
    );
  }
  return { supabase, user: signUp.data.user, created: true };
}

async function teardown(supabase) {
  const { data: rows, error } = await supabase
    .from("listings")
    .select("id, slug, listing_images ( storage_path )")
    .like("mls_number", `${MLS_PREFIX}%`);
  if (error) throw error;

  const paths = rows.flatMap((row) =>
    (row.listing_images ?? []).map((image) => image.storage_path),
  );
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

  const ids = rows.map((row) => row.id);
  if (ids.length) {
    const removed = await supabase.from("listings").delete().in("id", ids);
    if (removed.error) throw removed.error;
  }
  console.log(
    `removed ${ids.length} sample listings and ${paths.length} photos`,
  );
}

async function main() {
  const agent = await signInOrUp(agentEmail, agentPassword, "Listing Desk");
  console.log(`agent account ${agent.created ? "created" : "signed in"}`);

  const { data: profile, error: profileError } = await agent.supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", agent.user.id)
    .single();
  if (profileError) throw profileError;
  if (profile.role !== "agent") {
    throw new Error(
      `Profile ${agent.user.id} is role "${profile.role}". Promote it before seeding.`,
    );
  }

  if (process.argv.includes("--teardown")) {
    await teardown(agent.supabase);
    return;
  }

  await teardown(agent.supabase);

  for (const [index, listing] of listings.entries()) {
    const record = {
      ...listing,
      slug: listing.slug.replace(/\s+/g, ""),
      state: "TX",
      title: `${listing.street_address}, ${listing.city}`,
      mls_number: `${MLS_PREFIX}${String(index + 1).padStart(4, "0")}`,
      description: listing.description,
      published_at: new Date().toISOString(),
      created_by: agent.user.id,
    };

    const { data: saved, error } = await agent.supabase
      .from("listings")
      .insert(record)
      .select("id, slug")
      .single();
    if (error) throw new Error(`${record.slug}: ${error.message}`);

    const photos = await listingPhotos({
      seed: index + 1,
      count: 5,
      kind: listing.property_type === "land" ? "land" : "house",
    });
    for (const [position, photo] of photos.entries()) {
      const path = `${saved.id}/${String(position + 1).padStart(2, "0")}.jpg`;
      const upload = await agent.supabase.storage
        .from(BUCKET)
        .upload(path, photo, {
          contentType: "image/jpeg",
          cacheControl: "31536000",
          upsert: true,
        });
      if (upload.error) throw new Error(`${path}: ${upload.error.message}`);

      const image = await agent.supabase.from("listing_images").insert({
        listing_id: saved.id,
        storage_path: path,
        position,
        alt_text: `${listing.street_address}, ${listing.city}, Texas`,
      });
      if (image.error) throw new Error(`${path}: ${image.error.message}`);
    }
    console.log(`${saved.slug}: ${photos.length} photos`);
  }

  for (const entry of testimonials) {
    const { error } = await agent.supabase.from("testimonials").insert(entry);
    if (error && !error.message.includes("duplicate")) throw error;
  }

  const member = await signInOrUp(
    memberEmail,
    memberPassword,
    "Casey Whitfield",
  );
  console.log(`member account ${member.created ? "created" : "signed in"}`);

  console.log("seed complete");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});

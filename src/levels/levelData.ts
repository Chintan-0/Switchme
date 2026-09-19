import { LevelData } from '../types';

export const LEVELS: LevelData[] = [
  // =========================================================================
  // LEVEL 1 — “FIRST STEP”
  // Purpose: Teach the basic rules naturally.
  // RED moves RIGHT. SPACE jumps. Entering Color Switch turns Red → Blue.
  // Blue moves LEFT. Ample runway to understand direction change. Exit.
  // =========================================================================
  {
    id: 1,
    title: 'First Step',
    subtitle: 'Solo Mode • Level 1',
    spawn: {
      x: 100,
      y: 410,
      color: 'RED',
    },
    bounds: {
      minX: 40,
      maxX: 1200,
      minY: 40,
      maxY: 560,
    },
    hints: [
      {
        x: 230,
        y: 400,
        text: 'MOVE RIGHT',
        subtext: 'Press D or →',
        direction: 'right',
      },
      {
        x: 435,
        y: 400,
        text: 'SPACE',
        subtext: 'Jump',
        direction: 'jump',
      },
      {
        x: 960,
        y: 290,
        text: 'COLOR SWITCH',
        subtext: 'Enter to Change Direction',
      },
      {
        x: 570,
        y: 280,
        text: 'BLUE',
        subtext: 'Moves Left ←',
        direction: 'left',
      },
      {
        x: 220,
        y: 130,
        text: 'REACH THE EXIT',
      },
    ],
    platforms: [
      // Left safety boundary wall
      { id: 'l1_wall_left', x: 40, y: 160, width: 20, height: 328, isBarrier: true },

      // Phase 1: Starting Flat Runway (Learn Red moves Right)
      { id: 'l1_plat_start', x: 60, y: 460, width: 340, height: 28 },

      // Phase 2: First Jump Landing across gentle 70px gap
      { id: 'l1_plat_jump1', x: 470, y: 460, width: 220, height: 28 },

      // Phase 3: Step-up platform leading to the Color Switch
      { id: 'l1_plat_switch_approach', x: 760, y: 420, width: 360, height: 28 },

      // Right boundary wall behind the Color Switch
      { id: 'l1_wall_right', x: 1120, y: 220, width: 20, height: 228, isBarrier: true },

      // Phase 4: Reversing Course Leftward as Blue (Upper Tier Platform)
      { id: 'l1_plat_return_1', x: 440, y: 340, width: 260, height: 28, floating: true },

      // Phase 5: Exit Plateau (Gentle jump left into the Portal)
      { id: 'l1_plat_exit', x: 100, y: 260, width: 280, height: 28, floating: true },
    ],
    speedTiles: [],
    switches: [
      // Switch 1: Transforms Red → Blue
      {
        id: 'l1_switch_1',
        x: 960,
        y: 360,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
    ],
    exit: {
      id: 'l1_exit',
      x: 220,
      y: 200,
      radius: 34,
      pulsePhase: 0,
    },
  },

  // =========================================================================
  // LEVEL 2 — “THE TURN”
  // Purpose: Teach the player that switching is a deliberate gameplay decision.
  // "When should I switch?" ("I should switch because I need a different direction.")
  // Red moves Right → Switch 1 → Blue moves Left → Switch 2 → Red moves Right to Exit.
  // =========================================================================
  {
    id: 2,
    title: 'The Turn',
    subtitle: 'Solo Mode • Level 2',
    spawn: {
      x: 100,
      y: 150,
      color: 'RED',
    },
    bounds: {
      minX: 40,
      maxX: 1200,
      minY: 40,
      maxY: 580,
    },
    hints: [],
    platforms: [
      // -----------------------------------------------------------------------
      // TIER 1 (Top Tier, y = 200): Red moves Right
      // -----------------------------------------------------------------------
      { id: 'l2_t1_wall_left', x: 40, y: 90, width: 20, height: 138, isBarrier: true },
      { id: 'l2_t1_start', x: 60, y: 200, width: 340, height: 28 },
      { id: 'l2_t1_island', x: 490, y: 200, width: 220, height: 28, floating: true },
      { id: 'l2_t1_switch1_plat', x: 800, y: 200, width: 300, height: 28 },
      { id: 'l2_t1_wall_right', x: 1100, y: 90, width: 20, height: 138, isBarrier: true },

      // -----------------------------------------------------------------------
      // TIER 2 (Middle Tier, y = 350): Blue moves Left
      // -----------------------------------------------------------------------
      { id: 'l2_t2_landing', x: 740, y: 350, width: 320, height: 28, floating: true },
      { id: 'l2_t2_mid', x: 420, y: 350, width: 220, height: 28, floating: true },
      { id: 'l2_t2_switch2_plat', x: 80, y: 350, width: 240, height: 28 },
      { id: 'l2_t2_wall_left', x: 60, y: 240, width: 20, height: 138, isBarrier: true },

      // -----------------------------------------------------------------------
      // TIER 3 (Bottom Tier, y = 500): Red moves Right to Exit
      // -----------------------------------------------------------------------
      { id: 'l2_t3_landing', x: 80, y: 500, width: 300, height: 28 },
      { id: 'l2_t3_mid', x: 470, y: 500, width: 220, height: 28, floating: true },
      { id: 'l2_t3_exit_plat', x: 780, y: 500, width: 320, height: 28 },
      { id: 'l2_t3_wall_right', x: 1100, y: 390, width: 20, height: 138, isBarrier: true },
    ],
    speedTiles: [
      // Tier 1 Eastward boost for Red
      { id: 'l2_boost_red_t1', x: 180, y: 194, width: 160, height: 8, direction: 'RIGHT' },
      // Tier 2 Westward boost for Blue
      { id: 'l2_boost_blue_t2', x: 800, y: 344, width: 170, height: 8, direction: 'LEFT' },
      // Tier 3 Eastward boost for Red toward portal
      { id: 'l2_boost_red_t3', x: 170, y: 494, width: 180, height: 8, direction: 'RIGHT' },
    ],
    switches: [
      // Switch 1: Red → Blue
      {
        id: 'l2_sw_1',
        x: 950,
        y: 140,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 2: Blue → Red
      {
        id: 'l2_sw_2',
        x: 170,
        y: 290,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
    ],
    exit: {
      id: 'l2_exit',
      x: 940,
      y: 440,
      radius: 34,
      pulsePhase: 0,
    },
  },

  // =========================================================================
  // LEVEL 3 — “THE TRAP”
  // Purpose: Advanced puzzle thinking. "Where should I switch?"
  // Features:
  // - Tempting Trap Switch: An obvious low landing with a switch. Taking it turns
  //   you Blue in a dead-end cul-de-sac where moving Left is impossible!
  // - True Path: Stay Red to climb the upper steps to the Apex Switch.
  // - Apex Switch: Turns Red → Blue to navigate the high westward rafters.
  // - Switch 3: At the Apex Perch, turns Blue → Red for the final vault to the Exit!
  // =========================================================================
  {
    id: 3,
    title: 'The Trap',
    subtitle: 'Solo Mode • Level 3',
    spawn: {
      x: 90,
      y: 390,
      color: 'RED',
    },
    bounds: {
      minX: 30,
      maxX: 1200,
      minY: 20,
      maxY: 580,
    },
    hints: [],
    platforms: [
      // Starting Platform (Red moves Right)
      { id: 'l3_wall_start_left', x: 30, y: 310, width: 20, height: 158, isBarrier: true },
      { id: 'l3_plat_start', x: 50, y: 440, width: 230, height: 28 },

      // -----------------------------------------------------------------------
      // THE TEMPTING TRAP (Lower Floor)
      // Looks like a safe, obvious landing with a switch, but turns you Blue with
      // a sheer cliff on the left that cannot be scaled!
      // -----------------------------------------------------------------------
      { id: 'l3_plat_trap', x: 370, y: 520, width: 360, height: 28 },
      // Sheer barrier cliff to the left of the trap floor
      { id: 'l3_wall_trap_cliff', x: 260, y: 340, width: 24, height: 208, isBarrier: true },

      // -----------------------------------------------------------------------
      // THE TRUE ASCENT (Upper Eastward Route as Red)
      // Player bypasses the tempting trap and leaps across upper steps
      // -----------------------------------------------------------------------
      { id: 'l3_plat_step1', x: 350, y: 370, width: 140, height: 24, floating: true },
      { id: 'l3_plat_step2', x: 560, y: 300, width: 140, height: 24, floating: true },
      { id: 'l3_plat_apex_plateau', x: 770, y: 240, width: 240, height: 28, floating: true },
      { id: 'l3_wall_apex_right', x: 1010, y: 110, width: 20, height: 158, isBarrier: true },

      // -----------------------------------------------------------------------
      // THE HIGH WESTWARD TRAVERSE (Ceiling Rafters as Blue)
      // After hitting Switch 2, the player moves Left across high rafters
      // -----------------------------------------------------------------------
      { id: 'l3_plat_rafter1', x: 580, y: 180, width: 130, height: 24, floating: true },
      { id: 'l3_plat_rafter2', x: 370, y: 170, width: 130, height: 24, floating: true },

      // Apex Perch & Switch 3 Platform
      { id: 'l3_plat_perch', x: 110, y: 160, width: 190, height: 28, floating: true },
      { id: 'l3_wall_perch_left', x: 30, y: 30, width: 20, height: 158, isBarrier: true },

      // -----------------------------------------------------------------------
      // THE FINAL VAULT TO EXIT (High Eastward Approach as Red)
      // After hitting Switch 3, player is Red again, leaping to Exit Citadel
      // -----------------------------------------------------------------------
      { id: 'l3_plat_final_step1', x: 370, y: 110, width: 120, height: 22, floating: true },
      { id: 'l3_plat_final_step2', x: 560, y: 105, width: 120, height: 22, floating: true },
      { id: 'l3_plat_exit_citadel', x: 760, y: 100, width: 260, height: 28, floating: true },
      { id: 'l3_wall_exit_right', x: 1020, y: 10, width: 20, height: 118, isBarrier: true },
    ],
    speedTiles: [
      // Apex plateau launch pad for Red approaching Switch 2
      { id: 'l3_boost_red_apex', x: 790, y: 234, width: 140, height: 8, direction: 'RIGHT' },
      // High ceiling rafter speed run for Blue
      { id: 'l3_boost_blue_rafter', x: 590, y: 174, width: 110, height: 8, direction: 'LEFT' },
      // Final vault launch pad for Red heading to the Citadel Exit
      { id: 'l3_boost_red_vault', x: 570, y: 99, width: 100, height: 8, direction: 'RIGHT' },
    ],
    switches: [
      // Switch 1: The Tempting Trap Switch (Takes you to Blue in a dead-end)
      {
        id: 'l3_sw_trap',
        x: 520,
        y: 460,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 2: The Apex Switch (Red → Blue for high westward traverse)
      {
        id: 'l3_sw_apex',
        x: 880,
        y: 180,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 3: The Final Pivot (Blue → Red for final vault)
      {
        id: 'l3_sw_pivot',
        x: 180,
        y: 100,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
    ],
    exit: {
      id: 'l3_exit',
      x: 890,
      y: 40,
      radius: 34,
      pulsePhase: 0,
    },
  },

  // =========================================================================
  // LEVEL 4 — “THE GAP”
  // Purpose: Meaningful combination of color switching, large gaps,
  // fixed-direction speed boost tiles, and mid-air trajectory planning.
  // Lesson: "I need the correct COLOR and MOMENTUM before I cross the gap."
  // =========================================================================
  {
    id: 4,
    title: 'The Gap',
    subtitle: 'Solo Mode • Level 4',
    spawn: {
      x: 90,
      y: 460,
      color: 'RED',
    },
    bounds: {
      minX: 30,
      maxX: 1040,
      minY: 20,
      maxY: 580,
    },
    hints: [
      {
        x: 230,
        y: 280,
        text: 'THE GAP',
        subtext: 'Build Momentum',
        direction: 'right',
      },
    ],
    platforms: [
      // Left safety boundary for starting floor
      { id: 'l4_wall_start_left', x: 40, y: 380, width: 20, height: 160, isBarrier: true },

      // Phase 1: Starting Floor (Red moves Right)
      { id: 'l4_plat_start', x: 60, y: 510, width: 260, height: 28 },

      // Phase 1: Lower Approach to Switch 1 across a 90px gap
      { id: 'l4_plat_lower_switch', x: 410, y: 510, width: 320, height: 28 },
      { id: 'l4_wall_lower_right', x: 730, y: 410, width: 20, height: 130, isBarrier: true },

      // Phase 2: Ascending Westward as Blue (Mid Stepping Platform)
      { id: 'l4_plat_mid_step', x: 340, y: 430, width: 110, height: 24, floating: true },

      // Phase 3: The Launch Perch (Westward plateau with Switch 2 and Boost Pad)
      { id: 'l4_plat_launch', x: 60, y: 340, width: 290, height: 28, floating: true },
      { id: 'l4_wall_launch_left', x: 40, y: 220, width: 20, height: 150, isBarrier: true },

      // Phase 4: East Landing Plateau across THE GAP (330px wide chasm!)
      { id: 'l4_plat_east_landing', x: 680, y: 350, width: 260, height: 28, floating: true },
      { id: 'l4_wall_east_right', x: 940, y: 160, width: 20, height: 220, isBarrier: true },

      // Phase 4: Step to Switch 3
      { id: 'l4_plat_switch3', x: 790, y: 260, width: 150, height: 26, floating: true },

      // Phase 5: High Westward Ceiling Rafter (Blue moves Left to Citadel)
      { id: 'l4_plat_high_rafter', x: 570, y: 190, width: 160, height: 24, floating: true },

      // Phase 5: High Exit Citadel (Blue arrives at Exit Portal)
      { id: 'l4_plat_citadel', x: 230, y: 150, width: 270, height: 28, floating: true },
      { id: 'l4_wall_citadel_left', x: 210, y: 50, width: 20, height: 130, isBarrier: true },
    ],
    speedTiles: [
      // Launch Pad for Red across THE GAP (Fixed Eastward propulsion >>>)
      { id: 'l4_boost_gap', x: 180, y: 334, width: 160, height: 8, direction: 'RIGHT' },
    ],
    switches: [
      // Switch 1: Lower chamber pivot (Red → Blue to ascend to launch perch)
      {
        id: 'l4_sw_1',
        x: 570,
        y: 450,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 2: Launch perch pivot (Blue → Red to sprint across THE GAP)
      {
        id: 'l4_sw_2',
        x: 120,
        y: 280,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 3: High tier pivot (Red → Blue to cross high rafters to Exit)
      {
        id: 'l4_sw_3',
        x: 870,
        y: 200,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
    ],
    exit: {
      id: 'l4_exit',
      x: 320,
      y: 90,
      radius: 34,
      pulsePhase: 0,
    },
  },

  // =========================================================================
  // LEVEL 5 — “WRONG WAY”
  // Purpose: Teach the player: “I can reach a platform without necessarily being able to leave it.”
  // Concept: FORCED ROUTES. Reaching a platform ≠ Solving the platform.
  // =========================================================================
  {
    id: 5,
    title: 'Wrong Way',
    subtitle: 'Solo Mode • Level 5',
    spawn: {
      x: 80,
      y: 440,
      color: 'RED',
    },
    bounds: {
      minX: 30,
      maxX: 1060,
      minY: 10,
      maxY: 580,
    },
    hints: [
      {
        x: 230,
        y: 370,
        text: 'LOOK AHEAD',
        subtext: 'Reaching a platform ≠ Solving it',
      },
    ],
    platforms: [
      // Left safety boundary wall
      { id: 'l5_wall_left', x: 40, y: 200, width: 20, height: 320, isBarrier: true },

      // Section A: Starting Runway (Red moves Right)
      { id: 'l5_plat_start', x: 60, y: 490, width: 340, height: 28 },

      // Section A: Right lower platform across 80px gap
      { id: 'l5_plat_lower_right', x: 480, y: 490, width: 240, height: 28 },

      // Section A: Step to True Switch 1 (Elevated East Platform)
      { id: 'l5_plat_east_elevated', x: 770, y: 410, width: 240, height: 28, floating: true },
      { id: 'l5_wall_east_right', x: 1010, y: 80, width: 20, height: 440, isBarrier: true },

      // Section B: Ragebait #2 Safe Trap Platform (Large, safe landing, but walled on left!)
      { id: 'l5_plat_trap_low', x: 470, y: 390, width: 230, height: 28, floating: true },
      // The sheer barrier wall that traps Blue if they land on l5_plat_trap_low:
      { id: 'l5_wall_trap_culdesac', x: 450, y: 250, width: 20, height: 168, isBarrier: true },

      // Section B: The True High Overpass for Blue moving Left
      { id: 'l5_plat_high_step1', x: 660, y: 310, width: 120, height: 24, floating: true },
      { id: 'l5_plat_high_overpass', x: 440, y: 230, width: 160, height: 24, floating: true },

      // Section B: West Middle Perch (Blue lands and reaches Switch 2)
      { id: 'l5_plat_mid_west', x: 120, y: 240, width: 230, height: 28, floating: true },

      // Section C: The Ascent to Exit (Red moves Right)
      { id: 'l5_plat_climb1', x: 420, y: 160, width: 140, height: 24, floating: true },
      { id: 'l5_plat_climb2', x: 630, y: 120, width: 140, height: 24, floating: true },
      { id: 'l5_plat_exit', x: 830, y: 80, width: 190, height: 28, floating: true },
    ],
    speedTiles: [],
    switches: [
      // Ragebait #1: Tempting Switch right on starting runway.
      // If used immediately, player turns Blue on lower floor and cannot cross the gap to the right!
      {
        id: 'l5_sw_tempting',
        x: 230,
        y: 430,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // True Switch 1: Elevated on the east side (Red → Blue to take high overpass)
      {
        id: 'l5_sw_true_1',
        x: 890,
        y: 350,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 2: On west middle perch (Blue → Red to climb Section C to exit)
      {
        id: 'l5_sw_pivot_2',
        x: 180,
        y: 180,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
    ],
    exit: {
      id: 'l5_exit',
      x: 920,
      y: 20,
      radius: 34,
      pulsePhase: 0,
    },
  },

  // =========================================================================
  // LEVEL 6 — “BACKTRACK”
  // Purpose: Teach that progress does not always mean moving toward the exit.
  // Concept: BACKTRACKING. Forward isn't always progress.
  // =========================================================================
  {
    id: 6,
    title: 'Backtrack',
    subtitle: 'Solo Mode • Level 6',
    spawn: {
      x: 90,
      y: 460,
      color: 'RED',
    },
    bounds: {
      minX: 30,
      maxX: 1040,
      minY: 10,
      maxY: 580,
    },
    hints: [
      {
        x: 230,
        y: 400,
        text: 'REVERSAL',
        subtext: "Forward isn't always progress",
      },
    ],
    platforms: [
      // Left safety boundary wall
      { id: 'l6_wall_left', x: 40, y: 180, width: 20, height: 340, isBarrier: true },

      // Starting Floor (Red moves Right)
      { id: 'l6_plat_start', x: 60, y: 510, width: 280, height: 28 },

      // Lower East Floor with Backtrack Switch
      { id: 'l6_plat_lower_right', x: 420, y: 510, width: 260, height: 28 },

      // The False Ascent (East stairs leading to dead end)
      { id: 'l6_plat_east_step1', x: 720, y: 430, width: 130, height: 24, floating: true },
      { id: 'l6_plat_east_step2', x: 870, y: 350, width: 130, height: 24, floating: true },
      { id: 'l6_plat_east_shelf', x: 700, y: 270, width: 260, height: 28, floating: true },
      // East Dead-End barrier wall
      { id: 'l6_wall_east_deadend', x: 960, y: 50, width: 20, height: 250, isBarrier: true },

      // The True Westward Ascent (Blue climbs Left after backtracking to Switch 1)
      { id: 'l6_plat_west_step1', x: 360, y: 420, width: 130, height: 24, floating: true },
      { id: 'l6_plat_west_step2', x: 180, y: 340, width: 130, height: 24, floating: true },
      { id: 'l6_plat_west_perch', x: 60, y: 250, width: 220, height: 28, floating: true },

      // High Eastward Catwalks to Exit (Red moves Right)
      { id: 'l6_plat_catwalk1', x: 340, y: 180, width: 140, height: 24, floating: true },
      { id: 'l6_plat_catwalk2', x: 540, y: 130, width: 150, height: 24, floating: true },
      { id: 'l6_plat_exit', x: 750, y: 90, width: 200, height: 28, floating: true },
      { id: 'l6_wall_exit_right', x: 950, y: 10, width: 20, height: 110, isBarrier: true },
    ],
    speedTiles: [],
    switches: [
      // Switch 1: The Backtrack Switch (Tucked at lower right; player must drop back down to it)
      {
        id: 'l6_sw_backtrack',
        x: 550,
        y: 450,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 2: West Perch Switch (Blue → Red to traverse high catwalks to Exit)
      {
        id: 'l6_sw_perch',
        x: 140,
        y: 190,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
    ],
    exit: {
      id: 'l6_exit',
      x: 850,
      y: 30,
      radius: 34,
      pulsePhase: 0,
    },
  },

  // =========================================================================
  // LEVEL 7 — “THE LOOP”
  // Purpose: Sequencing and multi-step planning (RED → BLUE → RED → BLUE).
  // Lesson: "Plan the full sequence: forward, switch, return, switch again."
  // Mechanics: S-shaped vertical tiers, mid-air switch transition,
  // reverse boost pad puzzle on Blue route, final color filter before exit.
  // =========================================================================
  {
    id: 7,
    title: 'The Loop',
    subtitle: 'Solo Mode • Level 7',
    spawn: {
      x: 80,
      y: 460,
      color: 'RED',
    },
    bounds: {
      minX: 30,
      maxX: 1040,
      minY: 10,
      maxY: 580,
    },
    hints: [
      {
        x: 220,
        y: 390,
        text: 'THE LOOP',
        subtext: 'Forward • Switch • Reverse • Repeat',
        direction: 'right',
      },
    ],
    platforms: [
      // Left safety boundary wall
      { id: 'l7_wall_left', x: 40, y: 140, width: 20, height: 380, isBarrier: true },

      // Tier 1: Starting Floor (Red moves Right)
      { id: 'l7_plat_spawn', x: 60, y: 510, width: 260, height: 28 },
      { id: 'l7_plat_tier1_mid', x: 400, y: 510, width: 220, height: 28 },
      { id: 'l7_plat_tier1_east', x: 700, y: 510, width: 220, height: 28 },
      { id: 'l7_wall_east_lower', x: 980, y: 180, width: 20, height: 340, isBarrier: true },

      // Step to Switch 1
      { id: 'l7_plat_sw1_step', x: 800, y: 440, width: 140, height: 24, floating: true },

      // Tier 2: Blue moves Westward
      { id: 'l7_plat_tier2_east', x: 640, y: 370, width: 130, height: 24, floating: true },
      // Mid platform with the Reverse Boost Pad (Points RIGHT while Blue moves LEFT!)
      { id: 'l7_plat_tier2_mid', x: 320, y: 360, width: 260, height: 26, floating: true },
      // West Plateau of Tier 2 (Where Switch 2 sits)
      { id: 'l7_plat_tier2_west', x: 70, y: 340, width: 200, height: 28, floating: true },

      // Tier 3: East Rafters (Red launches across central chasm using the RIGHT boost)
      { id: 'l7_plat_tier3_east', x: 650, y: 260, width: 240, height: 26, floating: true },
      { id: 'l7_plat_sw3_step', x: 810, y: 190, width: 140, height: 24, floating: true },
      { id: 'l7_wall_east_upper', x: 980, y: 30, width: 20, height: 180, isBarrier: true },

      // Tier 4: High Catwalks & Exit Citadel (Blue traverses West to Exit)
      { id: 'l7_plat_high_mid', x: 500, y: 160, width: 140, height: 24, floating: true },
      { id: 'l7_plat_citadel', x: 150, y: 130, width: 260, height: 28, floating: true },
      // Citadel Left Wall
      { id: 'l7_wall_citadel_left', x: 130, y: 30, width: 20, height: 120, isBarrier: true },
      // Color-Check Ceiling Barrier: hangs over citadel entrance
      { id: 'l7_wall_citadel_barrier', x: 430, y: 30, width: 20, height: 85, isBarrier: true },
    ],
    speedTiles: [
      // Reverse Boost Pad on Tier 2: Points RIGHT.
      // Blue must jump OVER it to reach Switch 2 on the left.
      // Then Red uses it to launch across the chasm to Tier 3 on the right!
      { id: 'l7_boost_loop', x: 370, y: 354, width: 160, height: 8, direction: 'RIGHT' },
    ],
    switches: [
      // Switch 1: Turn Blue to ascend and navigate Tier 2 westward
      {
        id: 'l7_sw_1',
        x: 870,
        y: 380,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 2: Turn Red on west plateau to prepare for boosted eastward leap
      {
        id: 'l7_sw_2',
        x: 140,
        y: 280,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 3: Turn Blue on high east rafter to traverse Tier 4 westward to Citadel
      {
        id: 'l7_sw_3',
        x: 880,
        y: 130,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
    ],
    exit: {
      id: 'l7_exit',
      x: 230,
      y: 70,
      radius: 34,
      pulsePhase: 0,
    },
  },

  // =========================================================================
  // LEVEL 8 — “THE CHOICE”
  // Purpose: Multiple viable routes. Risk vs. Reward.
  // Lesson: "Two paths lead to the same destination: the patient climber or the daring speedster."
  // Routes:
  // - Route A (High): Safe, methodical platforming with switches.
  // - Route B (Low): High-speed boost sprint across a massive 340px chasm.
  // - Route C (Deceptive): A false mid-tier branch that leads to a dead-end drop.
  // =========================================================================
  {
    id: 8,
    title: 'The Choice',
    subtitle: 'Solo Mode • Level 8',
    spawn: {
      x: 90,
      y: 460,
      color: 'RED',
    },
    bounds: {
      minX: 30,
      maxX: 1120,
      minY: 10,
      maxY: 580,
    },
    hints: [
      {
        x: 230,
        y: 380,
        text: 'THE CHOICE',
        subtext: 'High & Safe • Low & Fast',
        direction: 'right',
      },
    ],
    platforms: [
      // Left boundary wall
      { id: 'l8_wall_left', x: 40, y: 100, width: 20, height: 420, isBarrier: true },

      // Shared Starting Floor (Red moves Right)
      { id: 'l8_plat_start', x: 60, y: 510, width: 320, height: 28 },

      // --- ROUTE B: LOW & FAST CHASM RUNWAY ---
      { id: 'l8_plat_b_runway', x: 380, y: 510, width: 200, height: 28 },
      // The 330px Giant Abyss from x: 580 to x: 910
      // Landing runway for Route B across the chasm
      { id: 'l8_plat_b_landing', x: 910, y: 510, width: 170, height: 28 },
      { id: 'l8_wall_b_right', x: 1080, y: 380, width: 20, height: 140, isBarrier: true },
      // Ascent for Route B up to the convergence terrace
      { id: 'l8_plat_b_step1', x: 950, y: 420, width: 120, height: 24, floating: true },
      { id: 'l8_plat_b_step2', x: 820, y: 340, width: 140, height: 24, floating: true },

      // --- ROUTE A: HIGH & SAFE STAIRWAY ---
      { id: 'l8_plat_a_step1', x: 230, y: 420, width: 120, height: 24, floating: true },
      { id: 'l8_plat_a_perch1', x: 70, y: 340, width: 180, height: 26, floating: true },
      { id: 'l8_plat_a_step2', x: 80, y: 250, width: 140, height: 24, floating: true },
      // Route A High Skywalk across the chasm ceiling
      { id: 'l8_plat_a_sky1', x: 270, y: 210, width: 160, height: 24, floating: true },
      { id: 'l8_plat_a_sky2', x: 490, y: 190, width: 160, height: 24, floating: true },
      { id: 'l8_plat_a_sky3', x: 700, y: 170, width: 160, height: 24, floating: true },

      // --- ROUTE C: DECEPTIVE MID-TIER TRAP ---
      { id: 'l8_plat_c_trap', x: 460, y: 380, width: 150, height: 24, floating: true },
      { id: 'l8_wall_c_trap_barrier', x: 610, y: 260, width: 20, height: 130, isBarrier: true },

      // --- SHARED EXIT CITADEL ---
      { id: 'l8_plat_exit', x: 860, y: 170, width: 220, height: 28, floating: true },
      { id: 'l8_wall_exit_right', x: 1080, y: 20, width: 20, height: 160, isBarrier: true },
    ],
    speedTiles: [
      // Route B High-Speed Launch Pad: Launches Red across the 330px Giant Abyss
      { id: 'l8_boost_chasm', x: 420, y: 504, width: 150, height: 8, direction: 'RIGHT' },
    ],
    switches: [
      // Route A Switch 1: Turn Blue to ascend to the high skywalk
      {
        id: 'l8_sw_a1',
        x: 130,
        y: 280,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Route A Switch 2: Turn Red to cross the high skywalk eastward
      {
        id: 'l8_sw_a2',
        x: 140,
        y: 190,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Route B Switch 1: Turn Blue on the east landing to reverse left to exit
      {
        id: 'l8_sw_b1',
        x: 880,
        y: 280,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Route C Decoy Trap Switch (Turns player Blue while walled on the left!)
      {
        id: 'l8_sw_c_trap',
        x: 530,
        y: 320,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
    ],
    exit: {
      id: 'l8_exit',
      x: 970,
      y: 110,
      radius: 34,
      pulsePhase: 0,
    },
  },

  // =========================================================================
  // LEVEL 9 — “DON'T TRUST IT”
  // Purpose: Psychological deception and deliberate ragebaits.
  // Lesson: "Question every obvious path. The easiest route is usually a trap."
  // 5 Ragebaits:
  // 1. Tempting switch on the starting runway (turns Blue before first gap).
  // 2. The Oasis: tempting large safe landing that traps Blue against a wall.
  // 3. Fake underpass shortcut with an insurmountable ceiling barrier.
  // 4. Reverse boost pad on mid-tier pointing LEFT to fling Red into the pit.
  // 5. Decoy visible exit chute with wrong-direction barrier.
  // =========================================================================
  {
    id: 9,
    title: "Don't Trust It",
    subtitle: 'Solo Mode • Level 9',
    spawn: {
      x: 80,
      y: 450,
      color: 'RED',
    },
    bounds: {
      minX: 30,
      maxX: 1080,
      minY: 10,
      maxY: 580,
    },
    hints: [
      {
        x: 220,
        y: 380,
        text: 'PARANOIA',
        subtext: 'Question every obvious path',
        direction: 'right',
      },
    ],
    platforms: [
      // Left safety boundary wall
      { id: 'l9_wall_left', x: 40, y: 120, width: 20, height: 400, isBarrier: true },

      // Starting Floor (Red moves Right)
      { id: 'l9_plat_start', x: 60, y: 500, width: 240, height: 28 },

      // Ragebait #2: The Oasis (Looks like a generous safe landing, but walled on left!)
      { id: 'l9_plat_oasis_trap', x: 500, y: 500, width: 240, height: 28 },
      { id: 'l9_wall_oasis_barrier', x: 470, y: 350, width: 20, height: 160, isBarrier: true },

      // The True Path: Ascending Westward Step
      { id: 'l9_plat_true_step1', x: 330, y: 430, width: 110, height: 24, floating: true },
      { id: 'l9_plat_true_west_perch', x: 80, y: 340, width: 210, height: 28, floating: true },

      // True Mid Catwalk (Blue moves West after True Switch 1)
      { id: 'l9_plat_true_west_step2', x: 80, y: 240, width: 140, height: 24, floating: true },
      { id: 'l9_plat_mid_cross', x: 260, y: 210, width: 240, height: 26, floating: true },

      // Ragebait #4 Platform with the Reverse Boost Trap:
      // Sits at y: 320, looks like a forward jump ramp, but has a LEFT boost!
      { id: 'l9_plat_boost_trap', x: 490, y: 320, width: 220, height: 26, floating: true },
      { id: 'l9_wall_boost_trap_back', x: 470, y: 200, width: 20, height: 120, isBarrier: true },

      // The True High Runway across to East Citadel (Red moves Right with TRUE boost)
      { id: 'l9_plat_true_high_runway', x: 540, y: 170, width: 220, height: 26, floating: true },

      // East True Exit Plateau
      { id: 'l9_plat_exit_plateau', x: 840, y: 150, width: 210, height: 28, floating: true },
      { id: 'l9_wall_east_right', x: 1050, y: 20, width: 20, height: 220, isBarrier: true },

      // Exit Gateway step
      { id: 'l9_plat_exit_step', x: 880, y: 80, width: 140, height: 24, floating: true },
    ],
    speedTiles: [
      // Ragebait #4: The Reverse Booster (Points LEFT <<<).
      // If player lands here thinking it's an eastward launch, it flings them backward into the pit!
      { id: 'l9_boost_trap', x: 520, y: 314, width: 150, height: 8, direction: 'LEFT' },

      // The True Forward Launch Pad: On high runway, points RIGHT >>>
      { id: 'l9_boost_true', x: 580, y: 164, width: 150, height: 8, direction: 'RIGHT' },
    ],
    switches: [
      // Ragebait #1: Tempting Switch right at spawn.
      // If taken, Red turns Blue with an uncrossable rightward gap!
      {
        id: 'l9_sw_trap_spawn',
        x: 200,
        y: 440,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // True Switch 1: High west perch (Red → Blue to take upper crossing)
      {
        id: 'l9_sw_true_1',
        x: 130,
        y: 280,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // True Switch 2: On mid cross platform (Blue → Red to hit true high booster)
      {
        id: 'l9_sw_true_2',
        x: 430,
        y: 150,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
    ],
    exit: {
      id: 'l9_exit',
      x: 950,
      y: 20,
      radius: 34,
      pulsePhase: 0,
    },
  },

  // =========================================================================
  // LEVEL 10 — “ONE MORE”
  // Purpose: Solo Campaign Grand Finale.
  // Lesson: "Every rule mastered. One final run."
  // 7 Epic Sections:
  // 1. Momentum Gap (Boost jump across 310px chasm).
  // 2. Mid-Air Switch (Red jumps, clips Switch 1 mid-flight, turns Blue to land).
  // 3. Backtrack Ascent (Blue climbs west across intermediate pillars).
  // 4. Dual Rafters (Choice of boosted high skip or safe stepping stones).
  // 5. Loopback Apex (Multi-switch transition across top rafters).
  // 6. The Final Mind Game (Narrow precision perches, avoiding trap drop).
  // 7. Grand Finale Leap (Boost-assisted sprint into the ultimate Exit Portal).
  // =========================================================================
  {
    id: 10,
    title: 'One More',
    subtitle: 'Solo Mode • Level 10 Finale',
    spawn: {
      x: 80,
      y: 470,
      color: 'RED',
    },
    bounds: {
      minX: 30,
      maxX: 1200,
      minY: 10,
      maxY: 580,
    },
    hints: [
      {
        x: 230,
        y: 400,
        text: 'THE GAUNTLET',
        subtext: 'Every rule mastered • One final run',
        direction: 'right',
      },
    ],
    platforms: [
      // Left safety boundary wall
      { id: 'l10_wall_left', x: 40, y: 100, width: 20, height: 420, isBarrier: true },

      // Section 1: Launch Runway & Momentum Chasm
      { id: 'l10_plat_start', x: 60, y: 520, width: 280, height: 28 },
      // Landing platform across 300px chasm (from x: 340 to x: 640)
      { id: 'l10_plat_sec1_landing', x: 640, y: 520, width: 220, height: 28 },
      { id: 'l10_wall_sec1_barrier', x: 860, y: 400, width: 20, height: 130, isBarrier: true },

      // Section 2: Mid-Air Shift Landing Shelf (Blue catches this after hitting mid-air switch!)
      { id: 'l10_plat_sec2_shelf', x: 460, y: 410, width: 140, height: 24, floating: true },

      // Section 3: The Backtrack Ascent Westward (Blue climbs Left)
      { id: 'l10_plat_sec3_step1', x: 310, y: 350, width: 120, height: 24, floating: true },
      { id: 'l10_plat_sec3_step2', x: 170, y: 290, width: 120, height: 24, floating: true },
      { id: 'l10_plat_sec3_perch', x: 60, y: 230, width: 180, height: 28, floating: true },

      // Section 4: Dual Rafters (Red moves Right across high canopy)
      { id: 'l10_plat_sec4_beam1', x: 280, y: 210, width: 150, height: 24, floating: true },
      { id: 'l10_plat_sec4_beam2', x: 480, y: 190, width: 200, height: 26, floating: true },

      // Section 5: Loopback Apex (East pivot)
      { id: 'l10_plat_sec5_east', x: 740, y: 190, width: 180, height: 26, floating: true },
      { id: 'l10_wall_sec5_barrier', x: 920, y: 90, width: 20, height: 130, isBarrier: true },
      // Top westward canopy for Blue
      { id: 'l10_plat_sec5_top_west', x: 520, y: 110, width: 180, height: 24, floating: true },
      { id: 'l10_plat_sec5_apex_perch', x: 300, y: 90, width: 160, height: 26, floating: true },

      // Section 6 & 7: The Grand Finale Launch Perch & Apex Chasm
      { id: 'l10_plat_sec7_launch', x: 500, y: 80, width: 240, height: 26, floating: true },

      // Crowning Exit Citadel across the grand void
      { id: 'l10_plat_sec7_citadel', x: 940, y: 100, width: 220, height: 28, floating: true },
      { id: 'l10_wall_citadel_right', x: 1160, y: 10, width: 20, height: 150, isBarrier: true },
    ],
    speedTiles: [
      // Section 1 Boost Pad: Propels Red across the first 300px chasm
      { id: 'l10_boost_sec1', x: 150, y: 514, width: 160, height: 8, direction: 'RIGHT' },

      // Section 4 High Rafter Boost Pad: Propels Red across high beam gap
      { id: 'l10_boost_sec4', x: 510, y: 184, width: 140, height: 8, direction: 'RIGHT' },

      // Section 7 Grand Finale Launch Pad: Propels Red into the Exit Citadel
      { id: 'l10_boost_finale', x: 560, y: 74, width: 160, height: 8, direction: 'RIGHT' },
    ],
    switches: [
      // Switch 1: Mid-Air Switch! Red leaps upward from Section 1 landing and hits this orb in mid-air.
      // Turns Blue mid-flight, allowing player to steer LEFT onto Section 2 shelf!
      {
        id: 'l10_sw_midair',
        x: 690,
        y: 430,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 2: High West Perch (Blue → Red to run across Section 4 high rafters)
      {
        id: 'l10_sw_perch_west',
        x: 120,
        y: 170,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 3: East Loopback Pivot (Red → Blue to ascend to apex canopy)
      {
        id: 'l10_sw_apex_east',
        x: 820,
        y: 130,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
      // Switch 4: Apex Perch Pivot (Blue → Red for the Grand Finale Launch)
      {
        id: 'l10_sw_apex_west',
        x: 360,
        y: 30,
        radius: 26,
        pulsePhase: 0,
        active: true,
      },
    ],
    exit: {
      id: 'l10_exit',
      x: 1050,
      y: 40,
      radius: 34,
      pulsePhase: 0,
    },
  },
];


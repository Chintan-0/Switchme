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
];

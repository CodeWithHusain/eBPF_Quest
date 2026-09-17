import { observeAProcessMission } from '../content/missions/observe-a-process.js';
import { exploreFileDescriptorsMission } from '../content/missions/explore-file-descriptors.js';
import { findANetworkInterfaceMission } from '../content/missions/find-a-network-interface.js';
import { traceAProcessEventMission } from '../content/missions/trace-a-process-event.js';
import { firstEbpfProgramMission } from '../content/missions/first-ebpf-program.js';

export const allMissions = [
  observeAProcessMission,
  exploreFileDescriptorsMission,
  findANetworkInterfaceMission,
  traceAProcessEventMission,
  firstEbpfProgramMission,
];

export const allMissionsMap = {
  [observeAProcessMission.slug]: observeAProcessMission,
  [exploreFileDescriptorsMission.slug]: exploreFileDescriptorsMission,
  [findANetworkInterfaceMission.slug]: findANetworkInterfaceMission,
  [traceAProcessEventMission.slug]: traceAProcessEventMission,
  [firstEbpfProgramMission.slug]: firstEbpfProgramMission,
};

/**
 * Service to retrieve and query missions
 */
export const missionService = {
  async getMissions() {
    return allMissions;
  },

  async getPublishedMissions() {
    return allMissions.filter((m) => m.isPublished);
  },

  async getMissionBySlug(slug) {
    return allMissionsMap[slug] || null;
  },

  async getMissionsByLessonSlug(lessonSlug) {
    return allMissions.filter((m) => m.lessonSlug === lessonSlug);
  },

  async getMissionsByCategory(category) {
    if (!category || category === 'ALL') return allMissions;
    return allMissions.filter(
      (m) => m.category.toUpperCase() === category.toUpperCase()
    );
  },

  async getMissionsByDifficulty(difficulty) {
    if (!difficulty || difficulty === 'ALL') return allMissions;
    return allMissions.filter(
      (m) => m.difficulty.toUpperCase() === difficulty.toUpperCase()
    );
  },
};

export default missionService;

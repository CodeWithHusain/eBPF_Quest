#!/usr/bin/env node
/**
 * BPFQuest Content Integrity Validator
 * 
 * Verifies that all curriculum courses, modules, lessons, missions,
 * and playground examples satisfy schema requirements, internal references,
 * and validator bindings before build and in CI.
 */

import { allCurriculumCourses, allLessonsMap } from '../src/services/contentService.js';
import { allMissions } from '../src/services/missionService.js';
import { allPlaygroundExamples } from '../src/services/playgroundService.js';
import { validateSubmission } from '../src/lib/validation/missionValidator.js';

let errors = 0;
let warnings = 0;

function logPass(msg) {
  console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
}

function logFail(msg) {
  console.error(`  \x1b[31m✖\x1b[0m ${msg}`);
  errors++;
}

function logWarn(msg) {
  console.warn(`  \x1b[33m⚠\x1b[0m ${msg}`);
  warnings++;
}

async function runValidation() {
  console.log('\n========================================');
  console.log(' BPFQuest Content Integrity Validation');
  console.log('========================================\n');

  // 1. Validate Courses & Curriculum Structure
  console.log('1. Checking Curriculum Courses...');
  if (!allCurriculumCourses || allCurriculumCourses.length === 0) {
    logFail('No curriculum courses discovered.');
  } else {
    for (const course of allCurriculumCourses) {
      if (!course.id || !course.slug || !course.title) {
        logFail(`Course missing mandatory metadata: ${JSON.stringify(course)}`);
        continue;
      }

      if (course.isPublished) {
        if (!Array.isArray(course.modules) || course.modules.length === 0) {
          logFail(`Published course '${course.slug}' has no modules defined.`);
        } else {
          for (const mod of course.modules) {
            if (!mod.id || !mod.slug || !mod.title) {
              logFail(`Module in ${course.slug} missing id/slug/title: ${mod.slug || 'unknown'}`);
            }
            if (!Array.isArray(mod.lessons) || mod.lessons.length === 0) {
              logFail(`Module ${mod.slug} in ${course.slug} has no lessons.`);
            }
          }
          logPass(`Published Course: ${course.title} (${course.slug}) [${course.modules.length} modules]`);
        }
      } else {
        logPass(`Roadmap Course: ${course.title} (${course.slug}) [Status: ${course.status || 'PLANNED'}]`);
      }
    }
  }

  // 2. Validate Lessons
  console.log('\n2. Checking Lessons & Knowledge Checks...');
  const lessonEntries = Object.entries(allLessonsMap);
  if (lessonEntries.length === 0) {
    logFail('No lessons discovered in allLessonsMap.');
  } else {
    for (const [slug, lesson] of lessonEntries) {
      if (!lesson.title) {
        logFail(`Lesson '${slug}' is missing a title.`);
      }
      if (!lesson.content || typeof lesson.content !== 'string' || lesson.content.trim().length < 50) {
        logFail(`Lesson '${slug}' content is missing or too short.`);
      }
      if (!Array.isArray(lesson.objectives) || lesson.objectives.length === 0) {
        logWarn(`Lesson '${slug}' has no explicit learning objectives listed.`);
      }

      // Check Knowledge Check
      if (!lesson.knowledgeCheck) {
        logFail(`Lesson '${slug}' is missing a knowledge check.`);
      } else if (Array.isArray(lesson.knowledgeCheck.questions)) {
        // Multi-question structure
        for (let i = 0; i < lesson.knowledgeCheck.questions.length; i++) {
          const q = lesson.knowledgeCheck.questions[i];
          if (!q.question && !q.prompt) {
            logFail(`Lesson '${slug}' question #${i + 1} has no prompt/question.`);
          }
          if (!Array.isArray(q.options) || q.options.length < 2) {
            logFail(`Lesson '${slug}' question #${i + 1} must have at least 2 options.`);
          }
          if (q.correctAnswer === undefined && q.correctIndex === undefined) {
            logFail(`Lesson '${slug}' question #${i + 1} has no correctAnswer specified.`);
          }
        }
      } else {
        // Single question structure
        const kc = lesson.knowledgeCheck;
        if (!kc.prompt && !kc.question && !kc.title) {
          logFail(`Lesson '${slug}' knowledge check has no prompt/question.`);
        }
        if (!Array.isArray(kc.options) || kc.options.length < 2) {
          logFail(`Lesson '${slug}' knowledge check must have at least 2 options.`);
        }
        if (kc.correctAnswer === undefined && kc.correctIndex === undefined) {
          logFail(`Lesson '${slug}' knowledge check has no correctAnswer specified.`);
        }
      }
    }
    logPass(`All ${lessonEntries.length} lessons validated for content, objectives, and knowledge check rigor.`);
  }

  // 3. Validate Hands-on Missions & Validator Bindings
  console.log('\n3. Checking Missions & Validator Bindings...');
  if (!allMissions || allMissions.length === 0) {
    logFail('No missions found in allMissions registry.');
  } else {
    for (const mission of allMissions) {
      if (!mission.id || !mission.slug || !mission.title || !mission.difficulty) {
        logFail(`Mission missing metadata: ${mission.slug || 'unknown'}`);
        continue;
      }

      // Test validator binding
      const validationTest = await validateSubmission({
        missionSlug: mission.slug,
        payload: { solutionText: 'test probe' },
      });

      if (validationTest.status === 'ERROR' && validationTest.feedback.includes('does not have an active validator')) {
        logFail(`Mission '${mission.slug}' has NO corresponding case in missionValidator.js!`);
      } else {
        logPass(`Mission: ${mission.title} (${mission.slug}) [Validator: Bound]`);
      }
    }
  }

  // 4. Validate Playground Examples
  console.log('\n4. Checking eBPF Playground Examples...');
  if (!allPlaygroundExamples || allPlaygroundExamples.length === 0) {
    logFail('No playground examples found.');
  } else {
    for (const example of allPlaygroundExamples) {
      const code = example.starterSource || example.code || '';
      const desc = example.shortDescription || example.description || '';

      if (!example.slug || !example.title || !code) {
        logFail(`Playground example missing fields: ${example.slug || 'unknown'}`);
      } else if (code.trim().length < 20) {
        logFail(`Playground example '${example.slug}' code snippet is suspiciously short.`);
      } else {
        logPass(`Example: ${example.title} (${example.slug}) [${example.category || 'eBPF'}]`);
      }
    }
  }

  // Final Summary
  console.log('\n========================================');
  console.log(` Validation Complete: ${errors} Errors, ${warnings} Warnings`);
  console.log('========================================\n');

  if (errors > 0) {
    console.error('\x1b[31mContent validation failed with errors.\x1b[0m\n');
    process.exit(1);
  } else {
    console.log('\x1b[32mAll content and validator references verified successfully.\x1b[0m\n');
    process.exit(0);
  }
}

runValidation().catch((err) => {
  console.error('Fatal content validation crash:', err);
  process.exit(1);
});

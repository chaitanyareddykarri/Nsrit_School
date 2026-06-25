-- ============================================================
-- Backfill: Migrate legacy class teacher assignments
-- from sections.class_teacher_id → teacher_section_assignments
--
-- Sections that have class_teacher_id set (from the legacy
-- AssignClassTeacher mutation) but no corresponding active row
-- in teacher_section_assignments are the root cause of:
--   - Teacher dashboard showing 0 sections
--   - AssignClassTeacherScreen showing empty assignments
--   - TeacherProfile showing no sections assigned
-- ============================================================

-- Step 1: Insert missing teacher_section_assignments rows for every
-- section whose class_teacher_id points to a user with a Teacher entity
-- but has no active class-teacher assignment record.
INSERT INTO teacher_section_assignments (
    id,
    teacher_id,
    section_id,
    assigned_by_id,
    is_class_teacher,
    is_active,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid()        AS id,
    t.id                     AS teacher_id,
    s.id                     AS section_id,
    NULL::uuid               AS assigned_by_id,
    true                     AS is_class_teacher,
    true                     AS is_active,
    NOW()                    AS created_at,
    NOW()                    AS updated_at
FROM sections s
INNER JOIN teachers t ON t.user_id = s.class_teacher_id
WHERE
    s.class_teacher_id IS NOT NULL
    AND s.is_active = true
    AND NOT EXISTS (
        SELECT 1
        FROM teacher_section_assignments tsa
        WHERE tsa.section_id = s.id
          AND tsa.is_class_teacher = true
          AND tsa.is_active = true
    )
ON CONFLICT (teacher_id, section_id, is_class_teacher) DO UPDATE
    SET is_active  = true,
        updated_at = NOW()
    WHERE teacher_section_assignments.is_active = false;

-- Step 2: Ensure CLASS_TEACHER role exists in user_roles for every
-- user referenced by sections.class_teacher_id who has a teacher profile.
INSERT INTO user_roles (user_id, role, created_at)
SELECT DISTINCT
    s.class_teacher_id AS user_id,
    'CLASS_TEACHER'    AS role,
    NOW()              AS created_at
FROM sections s
INNER JOIN teachers t ON t.user_id = s.class_teacher_id
WHERE
    s.class_teacher_id IS NOT NULL
    AND s.is_active = true
ON CONFLICT (user_id, role) DO NOTHING;

-- Verification: show counts after migration
SELECT
  'teacher_section_assignments backfilled' AS label,
  COUNT(*) AS count
FROM teacher_section_assignments
WHERE is_class_teacher = true AND is_active = true;

SELECT
  'sections with class_teacher_id set' AS label,
  COUNT(*) AS count
FROM sections
WHERE class_teacher_id IS NOT NULL AND is_active = true;

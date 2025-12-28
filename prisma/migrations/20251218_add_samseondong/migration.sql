-- Add region: Seoul Seongbuk-gu Samseon-dong
INSERT INTO region (sido, sigungu, eubmyeonli, region_code, created_at, updated_at)
VALUES ('서울특별시', '성북구', '삼선동', '1129010700', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

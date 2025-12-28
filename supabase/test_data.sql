-- Test Data for marcospeoples.com
-- Run this in Supabase SQL Editor to add sample memories

-- First, create a test user (simulating an anonymous user)
INSERT INTO users (auth_id, auth_type, name, email, profile_pic_url)
VALUES 
  ('test-user-1', 'anonymous', 'Maria Silva', NULL, NULL),
  ('test-user-2', 'anonymous', 'Jean Dubois', NULL, NULL),
  ('test-user-3', 'anonymous', 'Carlos Rodriguez', NULL, NULL)
ON CONFLICT (auth_id) DO NOTHING;

-- Get user IDs (store for reference)
DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  user3_id UUID;
BEGIN
  SELECT id INTO user1_id FROM users WHERE auth_id = 'test-user-1';
  SELECT id INTO user2_id FROM users WHERE auth_id = 'test-user-2';
  SELECT id INTO user3_id FROM users WHERE auth_id = 'test-user-3';

  -- Brussels Memories (4 memories)
  INSERT INTO memories (user_id, title, story, language, location_name, coordinates, latitude, longitude, year, time_period, tags, photo_count)
  VALUES
    (
      user1_id,
      'Coffee at Grand Place',
      'We spent hours at the café watching people walk by. Marcos loved the architecture and would point out every detail.',
      'en',
      'Grand Place, Brussels, Belgium',
      ST_GeogFromText('POINT(4.3517 50.8467)'),
      50.8467,
      4.3517,
      2015,
      '2010s',
      ARRAY['brussels', 'coffee', 'architecture'],
      1
    ),
    (
      user2_id,
      'Atomium Visit',
      'The day we climbed the Atomium together. Marcos was fascinated by the 1958 World Expo history.',
      'en',
      'Atomium, Brussels, Belgium',
      ST_GeogFromText('POINT(4.3417 50.8950)'),
      50.8950,
      4.3417,
      2018,
      '2010s',
      ARRAY['brussels', 'landmark', 'history'],
      2
    ),
    (
      user1_id,
      'European Parliament Debates',
      'Heated discussions about politics and the future of Europe. Marcos always had strong opinions.',
      'en',
      'European Quarter, Brussels, Belgium',
      ST_GeogFromText('POINT(4.3767 50.8417)'),
      50.8417,
      4.3767,
      2020,
      '2020s',
      ARRAY['brussels', 'politics', 'debates'],
      0
    ),
    (
      user3_id,
      'Manneken Pis Joke',
      'Marcos made everyone laugh with his commentary about the tiny statue. "Brussels''s biggest tourist attraction!"',
      'en',
      'Manneken Pis, Brussels, Belgium',
      ST_GeogFromText('POINT(4.3500 50.8450)'),
      50.8450,
      4.3500,
      2012,
      '2010s',
      ARRAY['brussels', 'humor', 'tourist'],
      1
    );

  -- London Memories (3 memories)
  INSERT INTO memories (user_id, title, story, language, location_name, coordinates, latitude, longitude, year, time_period, tags, photo_count)
  VALUES
    (
      user2_id,
      'Pub Quiz Champion',
      'The night Marcos won the pub quiz with his random knowledge about 1970s music. We couldn''t believe it!',
      'en',
      'The Churchill Arms, Kensington, London',
      ST_GeogFromText('POINT(-0.1932 51.5065)'),
      51.5065,
      -0.1932,
      2016,
      '2010s',
      ARRAY['london', 'pub', 'music', 'triumph'],
      2
    ),
    (
      user1_id,
      'Thames River Walk',
      'Long walks by the Thames discussing life, dreams, and the meaning of friendship.',
      'en',
      'South Bank, London, UK',
      ST_GeogFromText('POINT(-0.1195 51.5074)'),
      51.5074,
      -0.1195,
      2019,
      '2010s',
      ARRAY['london', 'thames', 'friendship'],
      3
    ),
    (
      user3_id,
      'British Museum Adventures',
      'Marcos could spend all day in the Egyptian section. His enthusiasm was contagious.',
      'en',
      'British Museum, London, UK',
      ST_GeogFromText('POINT(-0.1268 51.5194)'),
      51.5194,
      -0.1268,
      2014,
      '2010s',
      ARRAY['london', 'museum', 'history', 'egypt'],
      1
    );

  -- Santiago Memories (3 memories)
  INSERT INTO memories (user_id, title, story, language, location_name, coordinates, latitude, longitude, year, time_period, tags, photo_count)
  VALUES
    (
      user3_id,
      'Cerro San Cristóbal Sunset',
      'Watching the sunset over Santiago with Marcos. He loved this city and showed us all his favorite spots.',
      'es',
      'Cerro San Cristóbal, Santiago, Chile',
      ST_GeogFromText('POINT(-70.6350 -33.4250)'),
      -33.4250,
      -70.6350,
      2022,
      '2020s',
      ARRAY['santiago', 'sunset', 'mountain'],
      4
    ),
    (
      user1_id,
      'Mercado Central Food Tour',
      'Marcos introduced us to the best seafood in Santiago. His passion for Chilean food was incredible.',
      'es',
      'Mercado Central, Santiago, Chile',
      ST_GeogFromText('POINT(-70.6517 -33.4333)'),
      -33.4333,
      -70.6517,
      2021,
      '2020s',
      ARRAY['santiago', 'food', 'seafood', 'market'],
      5
    ),
    (
      user2_id,
      'La Moneda Palace History',
      'Marcos explained the entire history of Chilean democracy while standing in front of La Moneda. Unforgettable.',
      'es',
      'Palacio de La Moneda, Santiago, Chile',
      ST_GeogFromText('POINT(-70.6542 -33.4433)'),
      -33.4433,
      -70.6542,
      2023,
      '2020s',
      ARRAY['santiago', 'history', 'politics', 'democracy'],
      2
    );

END $$;

-- Verify inserted data
SELECT 
  m.title, 
  m.location_name, 
  m.year,
  ST_X(m.coordinates::geometry) as longitude,
  ST_Y(m.coordinates::geometry) as latitude,
  u.name as author
FROM memories m
JOIN users u ON m.user_id = u.id
WHERE u.auth_type = 'anonymous'
ORDER BY m.created_at DESC;

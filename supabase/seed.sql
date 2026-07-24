
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, is_sso_user)
VALUES (
  '00000000-0000-0000-0000-000000000001', 
  'testuser@example.com',
  crypt('password123', gen_salt('bf')), 
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  false
) ON CONFLICT (id) DO NOTHING;


INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"testuser@example.com"}',
  'email',
  'testuser@example.com',
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;


INSERT INTO public."Preferences" (user_id, username)
VALUES (
  '00000000-0000-0000-0000-000000000001', 
  'LVWTestUser'
);

CREATE TABLE public.Bills (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  bill json,
  CONSTRAINT Bills_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Committees (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  committee json NOT NULL,
  CONSTRAINT Committees_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Sponsors (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  sponsor json NOT NULL,
  CONSTRAINT Sponsors_pkey PRIMARY KEY (id)
);
# Supabase Functions Setup

## 1. Deploy the Function

To deploy the translation function, run:

```bash
supabase functions deploy translate-text
```

## 2. Set Environment Variables

You must set your Google Cloud Translation API Key as a secret:

```bash
supabase secrets set GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

## 3. Verify

Test the function using `curl`:

```bash
curl -i --location --request POST 'https://<project_ref>.supabase.co/functions/v1/translate-text' \
  --header 'Authorization: Bearer <anon_key>' \
  --header 'Content-Type: application/json' \
  --data '{"text": "Hello world", "target_lang": "ar"}'
```

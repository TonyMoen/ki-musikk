#!/bin/bash
# Song Generation API Test Script
# Story 3.5: Implement Song Generation API with Suno Integration

echo "🧪 Song Generation API Test Script"
echo "=================================="
echo ""

# Configuration
API_URL="http://localhost:3001"
USER_EMAIL=""  # You'll need to get this from your authenticated session

echo "📋 Test Checklist:"
echo "1. ✅ Dev server running: $API_URL"
echo "2. ⏳ User authenticated (check browser)"
echo "3. ⏳ User has ≥10 credits"
echo ""
echo "Press Enter when you're logged in and ready to test..."
read

echo ""
echo "=== Step 1: Check User Authentication ==="
echo "Open browser DevTools (F12) and run in Console:"
echo ""
echo "document.cookie"
echo ""
echo "Copy the session cookies and use them in curl requests below"
echo ""

echo "=== Step 2: Check Credit Balance ==="
echo "Run this in your browser console (while logged in):"
echo ""
echo "fetch('$API_URL/api/credits/balance')"
echo "  .then(r => r.json())"
echo "  .then(d => console.log('Balance:', d.data.balance))"
echo ""
echo "Or use this curl (you need to extract your session cookie):"
echo ""
echo "curl -v '$API_URL/api/credits/balance' \\"
echo "  -H 'Cookie: YOUR_SESSION_COOKIE_HERE'"
echo ""
echo "Press Enter to continue to song generation test..."
read

echo ""
echo "=== Step 3: Test Song Generation (Happy Path) ==="
echo ""
echo "Test Data:"
echo "  Genre: country-rock"
echo "  Concept: Funny birthday song for Lars who loves fishing"
echo "  Lyrics: 4 lines in Norwegian"
echo "  Phonetic: Enabled"
echo ""

# Generate test lyrics
TEST_LYRICS='Lars er mannen med fiskestanga
Han fisker hele dagen langa
På bursdagen hans vi synger
At han er best med ørretfangst'

echo "Copy this curl command and replace YOUR_SESSION_COOKIE:"
echo ""
cat << 'EOF'
curl -X POST http://localhost:3001/api/songs/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "genre": "country-rock",
    "concept": "Funny birthday song for Lars who loves fishing",
    "lyrics": "Lars er mannen med fiskestanga\nHan fisker hele dagen langa\nPå bursdagen hans vi synger\nAt han er best med ørretfangst",
    "phoneticEnabled": true,
    "title": "Lars sin bursdagssang"
  }'
EOF

echo ""
echo ""
echo "Expected response (202 Accepted):"
echo '{'
echo '  "data": {'
echo '    "songId": "uuid-here",'
echo '    "status": "generating",'
echo '    "estimatedTime": 120,'
echo '    "creditsDeducted": 10,'
echo '    "balanceAfter": 490'
echo '  }'
echo '}'
echo ""
echo "Save the songId for polling!"
echo ""
echo "Press Enter to continue to polling test..."
read

echo ""
echo "=== Step 4: Poll Song Status ==="
echo ""
echo "Replace SONG_ID with the UUID from Step 3:"
echo ""
echo "curl 'http://localhost:3001/api/songs/SONG_ID' \\"
echo "  -H 'Cookie: YOUR_SESSION_COOKIE'"
echo ""
echo "Poll every 5 seconds until status changes from 'generating' to 'completed'"
echo ""
echo "Expected progression:"
echo "  1. status='generating', progress=10-95%"
echo "  2. status='completed', audioUrl='https://...'"
echo "  3. OR status='failed', errorMessage='...'"
echo ""

echo ""
echo "=== Step 5: Verify Credit Deduction ==="
echo ""
echo "Check credit balance again:"
echo ""
echo "fetch('http://localhost:3001/api/credits/balance')"
echo "  .then(r => r.json())"
echo "  .then(d => console.log('New Balance:', d.data.balance))"
echo ""
echo "Expected: Balance decreased by 10 credits"
echo ""

echo ""
echo "=== Error Case Tests ==="
echo ""
echo "Test 1: Insufficient Credits"
echo "  - Use account with < 10 credits"
echo "  - Expected: 403 error with 'Ikke nok kreditter'"
echo ""
echo "Test 2: Invalid Genre"
echo "  - Use genre='invalid-genre'"
echo "  - Expected: 404 error with 'Genre not found'"
echo ""
echo "Test 3: Missing Required Fields"
echo "  - Omit 'lyrics' field"
echo "  - Expected: 400 error with 'Mangler påkrevd felt'"
echo ""
echo "Test 4: Not Authenticated"
echo "  - Remove Cookie header"
echo "  - Expected: 401 error with 'Ikke autentisert'"
echo ""

echo "=== Testing Complete ==="
echo ""
echo "✅ Check these in your terminal/browser:"
echo "  1. Song record created in database (status='generating')"
echo "  2. Credit transaction recorded (type='deduction', amount=-10)"
echo "  3. Suno API called successfully (check terminal logs)"
echo "  4. Song ID returned in response"
echo "  5. Poll endpoint returns song status"
echo "  6. Credits deducted correctly"
echo ""
echo "📝 If any test fails, check:"
echo "  - Terminal logs for errors"
echo "  - Browser console for client-side errors"
echo "  - Database for transaction records"
echo "  - SUNO_API_KEY is correct"
echo ""

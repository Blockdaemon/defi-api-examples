#!/bin/bash
success=()
failed=()
api_version=$(head -n 1 ./VERSION)
examples_version=$(git rev-parse --short HEAD)

for script in src/main/scripts/*.ts; do
  echo "Running $script..."
  if ts-node "$script"; then
    echo "Script $script passed"
    success+=("$script")
  else
    echo "Script $script failed"
    failed+=("$script")
  fi
done

echo -e "\n📊 Summary Report"
echo -e "================="
echo -e "DEFI API Version: v$api_version"
echo -e "Examples Version: $examples_version\n"

echo "✅ Successful Scripts (${#success[@]}):"
echo "--------------------------------"
if [ ${#success[@]} -eq 0 ]; then
  echo "No successful scripts"
else
  for s in "${success[@]}"; do
    echo "  ✓ $(basename "$s")"
  done
fi

echo -e "\n❌ Failed Scripts (${#failed[@]}):"
echo "----------------------------"
if [ ${#failed[@]} -eq 0 ]; then
  echo "No failed scripts"
else
  for f in "${failed[@]}"; do
    echo "  ✗ $(basename "$f")"
  done
fi

echo -e "\n=================\n"

if [ ${#failed[@]} -ne 0 ]; then
  echo "❌ ${#failed[@]} script(s) failed out of $((${#success[@]} + ${#failed[@]})) total scripts"
  exit 1
else
  echo "✅ All ${#success[@]} scripts completed successfully!"
  exit 0
fi

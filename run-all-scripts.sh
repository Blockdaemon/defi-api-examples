#!/bin/bash
success=()
failed=()

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

echo -e "\nSummary:"
echo "Successful scripts:"
for s in "${success[@]}"; do
  echo " - $s"
done

echo -e "\nFailed scripts:"
for f in "${failed[@]}"; do
  echo " - $f"
done

if [ ${#failed[@]} -eq 0 ]; then
  exit 0
else
  exit 1
fi

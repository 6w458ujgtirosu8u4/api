# Instrukcja pracy z GIT w projekcie marketing-tools

1. **Tworzenie nowego brancha**
   Każda nowa funkcjonalność lub poprawka powinna być realizowana na osobnym branchu. Nazwa brancha powinna być czytelna i opisywać cel zmian, np. `feature/nazwa-funkcji`, `fix/poprawka-opisu`, `hotfix/naprawa-buga`.

Przykład:

```sh
git checkout main
git pull origin main
git checkout -b feature/nowy-newsletter
```

2. **Robienie commitów**
   Komituj często, ale tylko skończone fragmenty pracy. Komentarz do commita powinien być krótki i opisywać co zostało zmienione, np. "Dodano obsługę wysyłki newslettera".

Przykład:

```sh
git add .
git commit -m "Dodano obsługę wysyłki newslettera"
```

3. **Pullowanie zmian z main**
   Przed rozpoczęciem pracy i przed pushowaniem swoich zmian, zawsze pobierz najnowsze zmiany z main:

```sh
git checkout main
git pull origin main
git checkout twoj-branch
git rebase main
```

4. **Pushowanie zmian**
   Po zakończeniu pracy na branchu wypchnij zmiany na zdalne repozytorium:

```sh
git push origin twoj-branch
# LUB
git push
```

5. **Rebase interaktywny (rebase -i)**
   Przed zrobieniem merge requesta (pull requesta) uporządkuj historię commitów za pomocą rebase interaktywnego:

```sh
git fetch origin
git rebase -i origin/main
```

W edytorze możesz połączyć commity (squash), zmienić ich kolejność lub poprawić opisy.

6. **Nazewnictwo branchy oraz commitów**
   Dla branchy używamy `/` oraz snake-case, dla commitów `:` oraz plain-text.

- feature – nowe funkcjonalności (`feature/nowy-newsletter`)
- fix – poprawki błędów (`fix/poprawa-walidacji`)
- hotfix – szybkie poprawki krytycznych błędów (`hotfix/naprawa-produkcji`)
- refactor – zadania techniczne, refaktoryzacje (`refactor/aktualizacja-dependencji`)
- docs – dokumentacja modułów
- style – zmiana wcięć, dodanie klamr
- perf – poprawa wydajności części metody
- test – testy dodawane do modułów
- build – zmiany związane z budowaniem kodu
- cicd – zmiany związane z deploymentem produkcyjnym
- revert – cofnięcie wcześniejszych zmian (z rebasem)
- chore – usuwanie lub update plików no-code

7. **Tworzenie pull requesta**
   Po zakończeniu pracy na branchu, utwórz pull request do main. Opisz krótko co zostało zrobione i poproś o code review.

Przykładowy workflow:

```sh
git checkout main
git pull origin main
git checkout -b feature/nowy-newsletter
...kodowanie...
git add .
git commit -m "Dodano obsługę wysyłki newslettera"
git fetch origin
git rebase -i origin/main
git push origin feature/nowy-newsletter
```

Utwórz pull request na GitHubie.

Dbaj proszę o czytelną historię commitów i przejrzystość pracy!

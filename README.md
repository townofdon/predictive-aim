# Predictive Aim Using Maths

From YouTube video: [Predictive Aim in Unity](https://www.youtube.com/watch?v=2zVwug_agr0)

Demo: https://editor.p5js.org/townofdon/sketches/SKwR4wEsD

## Problem

A common goal of game-dev is to create compelling enemies who react to the player's actions. One way to make the enemy feel "smarter" is to grant it the ability to predictively aim.

There are [lots of ways](https://youtu.be/Z6qBeuN-H1M?si=BnqsTfkygwPBptV-) to solve this problem. One method uses the [Law of Cosines](https://en.wikipedia.org/wiki/Law_of_cosines) as well as the [Quadratic Formula](https://en.wikipedia.org/wiki/Quadratic_formula) to calculate a 100% accurate predictive aim solution for AI bots.

One "gotcha" of this approach is that the calculation will return a null result if no solution exists. This may, however, be a feature rather than a bug. If no intercept solution is found, the AI could continue to fire at the previous intercept solution, fire directly at the target's current position, or decide not to fire at all.

## Definition of Terms

Given the following triangle:

```
A----------   dB
 |         ---------
  |                 ------C
   |                   --
    |                --
     |             --
  dC  |          -- dA
       |       --
        |    --
         | --
          B
```

Let's define the following:

- A => Target Position
- B => Turret Position
- C => Intercept Position (if one exists)

Additional terms:

- dC => distance of AB
- dA => distance of BC
- dB => distance of AC
- alpha => angle of A (angle between target velocity and AB)
- sA => speed of target (magnitude of velocity)
- sB => speed of turret projectile

We know the following information:

- dC
- alpha
- sA
- sB

We are interested in finding:

- dB

The thing we are solving for is _time_.

## Time and Distance

Given what we know:

> `D = S * T` - _distance equals speed multiplied by time_

Plugging in from our model above:

```
dB = sA * t
dA = sB * t
// therefore:
t = dB / sA
t = dA / sB
// substitute:
dB = sA * (dA / sB)
// rule of reciprocals:
dB = dA * (sA / sB)
```

## Ratio

Let's define some terms.

```
let r = sA / sB
```

`r` above is the ratio of the speed of our target to the speed of the turret's projectile.

Therefore:

```
dB = dA * r
```

## Law of Cosines

One of the equations provided by the [Law of Cosines](https://en.wikipedia.org/wiki/Law_of_cosines) is the following:

```
a^2 = b^2 + c^2 - 2bc * cos(alpha)
```

Let's plug in our model:

```
dA^2 = dB^2 + dC^2 - 2 * dB * dC * cos(alpha)
```

And substitute in `dB = dA * r`:

```
dA^2 = (dA * r)^2 + dC^2 - 2 * dB * dC * cos(alpha)
```

If we rearrange our terms to equal zero, we get the following:

```
(1 - r^2) * dA^2 + 2 * dC * r * cos(alpha) * dA - dC ^ 2 = 0
```

Kinda hard to see, but this is the form of a [quadratic equation](https://en.wikipedia.org/wiki/Quadratic_equation):

```
ax^2 + bx + c = 0
```

Where:

- `x` = `dA`
- `a` = `1 - r^2`
- `b` = `2 * dC * r * cos(alpha)`
- `c` = `dC ^ 2`

## Quadratic Formula

Now, we just need to solve for `x` (`dA`):

```
              discriminant
               |-------|
x = (-b ± SQRT(b^2 - 4ac)) / (2a)
```

This yields us `dA`, if a solution exists (e.g. the discriminant is zero or greater).

Now, we have the missing puzzle piece to calculate the intercept position.

```
time = dA / sB
interceptPoint = targetPosition + targetVelocity * time
interceptHeading = | interceptPoint - turretPosition |
```

The resulting interceptHeading is the unit vector from the turretPosition towards the interceptPoint.

Multiply `interceptHeading` by turret projectile speed and you're good to go!

## Gameplay Considerations

A 100% accurate AI is not any fun at all. In fact, this is a recipe for a very frustrating enemy.

Here are some possible solutions to mix in predictive aim while preserving fairness:

- Mix in intercept heading with target heading:

    ```
    finalHeading = Vector.lerp(headingToTarget, interceptHeading, botAccuracy)
    // where botAccuracy is [0-1]
    ```

- Start a timer when a bot first starts firing, so that it hones in on player position over time

    ```
    finalHeading = Vector.lerp(headingToTarget, interceptHeading, timeSinceStartedFiring)
    ```

- Add some randomness to the enemy's aim (highly recommend this anyways for better game feel)

    ```
    amount = (Math.random() * 2 - 1) // value between [-1,1] 
    angle = amount * randomAimAngleAmount
    finalHeading = Quarternion.eulerAngles(0, 0, angle) * Vector.lerp()
    ```

- Or a combination of all of the above! Mix and match to your heart's content. Whatever feels good IS good.

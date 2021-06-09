export const player = new XEntity({
    attributes: { collide: true, see: true },
    bounds: { h: 5, w: 20 },
    sprite: new XSprite({
        attributes: { persist: true },
        textures: [
            new XTexture({
                source: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAdCAYAAABIWle8AAAABHNCSVQICAgIfAhkiAAAAWhJREFUSEudlDFOw0AQRe0oXaQUFBwiRdpUoecE3CJ34Ar0OQAnoA8VLUXOgCgoIlEH/bW+Nfvnb2RsyUr278zbP97Z7Tvz7O/WVyNX0vvPpdeYJEwBEaLACvYfkAOOsDkgBS607jljGikwdXV6y0inaVRyxqSYrCAdE1q+WXTWClQXGD881upCS3RJt7S4eCoTif3uUl59VNcq+rklcqFYqnUWHambOKffrHKGQLWupWKsEMYkGCda0BYIeWNr4NC2dpZgB2KeHnpXUenB68fw6mI6TldQJGpwnHNO0m4CwHfz8pncUmNMDEj3GYLPh23nQDGRMfily+o+I+j19zs5UuFpdV8k5gC41CCMn49fTq60TTdUEEV7005xBgjd4X9yhn5CL01xVhwdhhPD/qt20zVlLMP9jznjN+OOaG9ht/i4HY79lvrMre4a1MWlE6DOkASY0zlHcGqNVrnqxLm1ZbZcRKCL+QN2TqVClANQYAAAAABJRU5ErkJggg=='
            })
        ]
    }),
    position: { x: 150, y: 0 }
});

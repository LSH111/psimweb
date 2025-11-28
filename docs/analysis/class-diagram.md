# Class Diagram

The class diagram for the project lives in `src/test/resources/psim-class-diagram.puml`. Use the dedicated Maven profile to render it so the diagram stays close to the source.

## Generate the diagram

1. (Once) install Graphviz if PlantUML cannot find `dot` (e.g. `brew install graphviz` on macOS).
2. Run the diagram profile:

```bash
# from the project root (where pom.xml is)
mvn -Pdiagrams generate-resources
```

The SVG will be written to `target/diagrams/psim-class-diagram.svg` and an XMI (for UML tools such as Amateras UML) to `target/diagrams/psim-class-diagram.xmi`.

### Amateras UML

- In Amateras UML, import the generated `psim-class-diagram.xmi` to view/edit the class diagram.

## Updating the source

- Keep `src/test/resources/psim-class-diagram.puml` as the single source of truth for the architecture sketch.
- After edits, re-run the command above to refresh the generated SVG so teammates can view the latest diagram.

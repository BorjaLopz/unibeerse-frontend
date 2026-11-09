FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 10001 unibeerse && mkdir -p /data/media && chown -R unibeerse /data
COPY --from=build /app/target/unibeerse-api-*.jar app.jar
USER unibeerse
ENV JAVA_OPTS="-Xms96m -Xmx256m"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]

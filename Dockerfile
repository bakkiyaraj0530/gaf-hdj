FROM microsoft/dotnet:2.1-aspnetcore-runtime AS base

RUN apt-get update \
    && apt-get -y install gnupg \
    && curl -sL https://deb.nodesource.com/setup_10.x | bash \
    && apt-get -y install nodejs \
    && apt-get -y install bzip2 \
    && apt-get -y install libfontconfig

WORKDIR /app
COPY ./build/ /app/

HEALTHCHECK --interval=2s --timeout=3s --retries=3 CMD curl --silent --fail http://0.0.0.0:80/healthcheck || exit 1

EXPOSE 80

CMD [ "npm", "start" ]

ENTRYPOINT ["dotnet", "/app/GAF.MyRoof.com.dll"]
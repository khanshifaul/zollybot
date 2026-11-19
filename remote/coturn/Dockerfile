FROM coturn/coturn:4.17.2-r0
COPY remote/coturn/turnserver.conf /etc/coturn/zollybot.conf
COPY remote/coturn/entrypoint.sh /usr/local/bin/zollybot-coturn
ENTRYPOINT ["/usr/local/bin/zollybot-coturn"]

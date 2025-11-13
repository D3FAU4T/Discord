import requests
from bs4 import BeautifulSoup
from io import BytesIO
from disnake.ext.commands import slash_command, InteractionBot
from disnake import (
    ApplicationCommandInteraction,
    Colour,
    Embed,
    File,
    Option,
    OptionType,
)


@slash_command(
    name="definir",
    description="Obter a definição de uma palavra",
    options=[
        Option(
            name="palavra",
            description="Digite a palavra para a qual deseja definição",
            required=True,
            type=OptionType.string,
        )
    ]
)
async def comando_definir(interaction: ApplicationCommandInteraction, palavra: str) -> None:
    await interaction.response.defer()

    # Fetch the dictionary page
    response = requests.get(f"https://dicionario.priberam.org/{palavra}")
    if not response.ok:
        await interaction.edit_original_response(
            embed=Embed(
                title="Erro de Dicionário",
                description=f"O servidor respondeu com {response.status_code}. Parece que ele tirou folga hoje 😅",
                colour=Colour.red(),
            )
        )
        return

    # Parse HTML
    soup = BeautifulSoup(response.text, "html.parser")
    img_tag = soup.find("img", loading="lazy")

    if not img_tag or not img_tag.get("src"):
        await interaction.edit_original_response(
            embed=Embed(
                title="Erro de Dicionário",
                description=f"Ih, não rolou! O servidor disse que essa palavra aí não tá no dicionário não 😅",
                colour=Colour.red(),
            )
        )
        return

    img_url = img_tag["src"]
    
    if type(img_url) is not str or not img_url.startswith("http"):
        await interaction.edit_original_response(
            embed=Embed(
                title="Erro de Dicionário",
                description="A URL da imagem está em um formato inesperado.",
                colour=Colour.red(),
            )
        )
        return
    
    img_response = requests.get(img_url)
    if not img_response.ok:
        await interaction.edit_original_response(
            embed=Embed(
                title="Erro de Dicionário",
                description=f"A imagem não pôde ser carregada: {img_response.status_code}",
                colour=Colour.red(),
            )
        )
        return

    # Send image as file
    image_bytes = BytesIO(img_response.content)
    await interaction.edit_original_response(
        files=[File(
            fp=image_bytes,
            filename=f"{palavra}.png",
            description=f"Definição de {palavra}"
        )]
    )


def setup(bot: InteractionBot):
    bot.add_slash_command(comando_definir)

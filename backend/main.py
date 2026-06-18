"""
SAP — Backend GEE Tile Service
Render free tier · ~15 linhas de lógica real
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import ee
import os
import json
import tempfile

app = FastAPI(title="SAP GEE Tile Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

PALETTE = ["#FFFFFF", "#FCFF50", "#F4D48A", "#D0782A", "#CA281B", "#640E08"]


def init_ee():
    """
    Em produção (Render): usa variáveis de ambiente GEE_SERVICE_ACCOUNT e GEE_KEY_JSON.
    Em desenvolvimento local: usa `earthengine authenticate` ou gcloud.
    """
    sa_email = os.environ.get("GEE_SERVICE_ACCOUNT")
    key_json  = os.environ.get("GEE_KEY_JSON")

    if sa_email and key_json:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            f.write(key_json)
            key_path = f.name
        credentials = ee.ServiceAccountCredentials(sa_email, key_path)
        ee.Initialize(credentials)
        print(f"✅ GEE inicializado com conta de serviço: {sa_email}")
    else:
        # Desenvolvimento local: exige `earthengine authenticate` feito antes
        ee.Initialize()
        print("✅ GEE inicializado com credenciais locais.")


try:
    init_ee()
except Exception as e:
    print(f"⚠️  GEE não inicializado: {e}")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/tile-url")
def get_tile_url(imageId: str, min: int = 0, max: int = 5):
    """
    Recebe o imageId de um asset GEE e devolve a URL de tiles autenticada.
    Exemplo: /tile-url?imageId=projects/ee-ulissesalencar17/assets/monitor_ana_2026_04
    """
    try:
        image = ee.Image(imageId)
        map_id = image.getMapId({
            "min": min,
            "max": max,
            "palette": PALETTE,
        })
        tile_url = map_id["tile_fetcher"].url_format
        return {"tileUrl": tile_url, "imageId": imageId}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro GEE: {str(e)}")
